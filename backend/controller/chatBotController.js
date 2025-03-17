import { SessionsClient } from "@google-cloud/dialogflow";
import Job from "../models/Job.js";

// Webhook handler for Dialogflow
export const handleWebhook = async (req, res) => {
  try {
    const intentName = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;

    if (intentName === "FindJobs") {
      const category = parameters.category || "";
      const location = parameters.location || "";

      console.log("Finding jobs with category:", category, "location:", location);

      const query = {};
      if (category) query.category = category;
      if (location) query.location = { $regex: location, $options: "i" };

      const jobs = await Job.find(query).limit(3);

      let response;
      if (jobs.length === 0) {
        response = "Sorry, I couldn’t find any jobs matching your criteria.";
      } else {
        response = "Here are some jobs I found:\n";
        jobs.forEach((job) => {
          response += `- ${job.title} at ${job.companyId.name} in ${job.location}\n`;
        });
        response += "Visit the job listing page to apply!";
      }

      res.json({
        fulfillmentText: response,
      });
    } else {
      res.json({
        fulfillmentText: "I’m not sure how to handle that intent yet.",
      });
    }
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.json({
      fulfillmentText: "Sorry, something went wrong on the server.",
    });
  }
};

// API for frontend to send messages to Dialogflow
export const sendMessageToDialogflow = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    const sessionClient = new SessionsClient();
    const sessionPath = sessionClient.projectAgentSessionPath("job-portal-bot", sessionId);

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: "en-US",
        },
      },
    };

    const [responses] = await sessionClient.detectIntent(request);
    const result = responses.queryResult;
    const botResponse = result.fulfillmentText;

    res.json({ success: true, response: botResponse });
  } catch (error) {
    console.error("Dialogflow error:", error.message);
    res.json({ success: false, message: error.message });
  }
};