import Job from "../models/Job.js";
import jobApplication from "../models/jobApplication.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper function to detect database-related patterns
const handleDatabaseQuery = async (message, user) => {
  // Pattern for finding jobs by location
  const locationMatch = message.match(/find jobs in ([\w\s]+)$/i);
  if (locationMatch) {
    const location = locationMatch[1].trim();
    const jobs = await Job.find({ location: { $regex: location, $options: 'i' } }).limit(5);
    if (jobs.length > 0) {
      const jobList = jobs.map(job => `<li>${job.title} in ${job.location} - <a href="/apply-job/${job._id}">Apply Now</a></li>`).join("");
      return `<p>Here are some jobs in ${location}:</p><ul>${jobList}</ul>`;
    } else {
      return `<p>No jobs found in ${location}. Try a different location or check back later.</p>`;
    }
  }

  // Pattern for finding jobs by title
  const jobTitleMatch = message.match(/show me jobs for ([\w\s]+)$/i);
  if (jobTitleMatch) {
    const jobTitle = jobTitleMatch[1].trim();
    const jobs = await Job.find({ title: { $regex: jobTitle, $options: 'i' } }).limit(5);
    if (jobs.length > 0) {
      const jobList = jobs.map(job => `<li>${job.title} in ${job.location} - <a href="/apply-job/${job._id}">Apply Now</a></li>`).join("");
      return `<p>Here are some ${jobTitle} jobs:</p><ul>${jobList}</ul>`;
    } else {
      return `<p>No ${jobTitle} jobs found. Try a different title or check back later.</p>`;
    }
  }

  // Pattern for application status (requires authentication)
  if (message.toLowerCase().includes("what is my application status")) {
    if (!user) {
      return "<p>Please log in to check your application status.</p>";
    }
    const applications = await Application.find({ userId: user.id });
    if (applications.length > 0) {
      const appList = applications.map(app => `<li>${app.jobTitle}: ${app.status}</li>`).join("");
      return `<p>Your application statuses:</p><ul>${appList}</ul>`;
    } else {
      return "<p>You haven't applied to any jobs yet.</p>";
    }
  }

  // Pattern for job details by title
  if (message.toLowerCase().startsWith("tell me about job ")) {
    const jobTitle = message.substring(17).trim();
    const job = await Job.findOne({ title: { $regex: jobTitle, $options: 'i' } });
    if (job) {
      return `<p>Job Title: ${job.title}</p><p>Location: ${job.location}</p><p>Description: ${job.description}</p><p>Salary: ${job.salary}</p><a href="/apply-job/${job._id}">Apply Now</a>`;
    } else {
      return `<p>No job found with title "${jobTitle}". Please check the title and try again.</p>`;
    }
  }

  return null; // No database query matched
};

const chatBot = async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.auth?.userId ? await clerk.users.getUser(req.auth.userId) : null;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // Try to handle with database first
    const dbResponse = await handleDatabaseQuery(message, user);
    if (dbResponse) {
      return res.json({ success: true, response: dbResponse });
    }

    // Fallback to Gemini API for general queries
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = `
      You are a helpful job assistant for a job portal called JobPortal.
      The portal uses Clerk for user authentication, so no account creation is needed if users are logged in.
      Respond concisely and directly to the user's query in well-formed HTML format (e.g., use <p>, <ul>, <li> tags).
      - For "How do I apply?": "<p>To apply on JobPortal, find a job listing, click ‘Apply Now’, and upload your resume. If you’re logged in with Clerk, your profile is used. Need help finding a job?</p>"
      - For greetings like 'Hi' or 'Hello': "<p>Hi! I’m your JobPortal assistant. How can I help you today?</p>"
      - For other queries, provide a helpful, concise response related to job searching or applications on JobPortal.
      User query: ${message}
    `;

    const result = await model.generateContent(prompt);
    const botResponse = result.response.text();

    res.json({ success: true, response: botResponse });
  } catch (error) {
    console.error("Chatbot error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default chatBot;