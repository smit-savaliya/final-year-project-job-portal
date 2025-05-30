import Job from "../models/Job.js";
import JobApplication from "../models/jobApplication.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper function to handle database queries
const handleDatabaseQuery = async (message, userId) => {
  // Pattern for finding jobs by location and job title
  const bothMatch = message.match(/find (.+) jobs in (.+)$/i);
  if (bothMatch) {
    const jobTitle = bothMatch[1].trim();
    const location = bothMatch[2].trim();
    const jobs = await Job.find({
      title: { $regex: jobTitle, $options: 'i' },
      location: { $regex: location, $options: 'i' },
      visible: true
    }).limit(5);
    if (jobs.length > 0) {
      const jobList = jobs.map(job => `${job.title} in ${job.location} (Category: ${job.category}, Level: ${job.level}) - Apply at /apply-job/${job._id}`).join("\n");
      return `Here are some ${jobTitle} jobs in ${location}:\n${jobList}`;
    } else {
      return `No ${jobTitle} jobs found in ${location}. Try a different search.`;
    }
  }

  // Pattern for finding jobs by location
  const locationMatch = message.match(/find jobs in (.+)$/i);
  if (locationMatch) {
    const location = locationMatch[1].trim();
    const jobs = await Job.find({ location: { $regex: location, $options: 'i' }, visible: true }).limit(5);
    if (jobs.length > 0) {
      const jobList = jobs.map(job => `${job.title} in ${job.location} (Category: ${job.category}, Level: ${job.level}) - Apply at /apply-job/${job._id}`).join("\n");
      return `Here are some jobs in ${location}:\n${jobList}`;
    } else {
      return `No jobs found in ${location}. Try a different location or check back later.`;
    }
  }

  // Pattern for finding jobs by title
  const jobTitleMatch = message.match(/show me (.+) jobs$/i);
  if (jobTitleMatch) {
    const jobTitle = jobTitleMatch[1].trim();
    const jobs = await Job.find({ title: { $regex: jobTitle, $options: 'i' }, visible: true }).limit(5);
    if (jobs.length > 0) {
      const jobList = jobs.map(job => `${job.title} in ${job.location} (Category: ${job.category}, Level: ${job.level}) - Apply at /apply-job/${job._id}`).join("\n");
      return `Here are some ${jobTitle} jobs:\n${jobList}`;
    } else {
      return `No ${jobTitle} jobs found. Try a different title or check back later.`;
    }
  }

  // Pattern for latest jobs
  if (message.toLowerCase().includes("latest jobs")) {
    const latestJobs = await Job.find({ visible: true }).sort({ date: -1 }).limit(5);
    const jobList = latestJobs.map(job => `${job.title} in ${job.location} (Category: ${job.category}, Level: ${job.level}) - Apply at /apply-job/${job._id}`).join("\n");
    return `Here are the latest job postings:\n${jobList}`;
  }

  // Pattern for application status
  if (message.toLowerCase().includes("application status")) {
    if (!userId) {
      return "Please log in to check your application status.";
    }
    const applications = await JobApplication.find({ userId });
    if (applications.length > 0) {
      const appList = await Promise.all(applications.map(async app => {
        const job = await Job.findById(app.jobId);
        return `${job ? job.title : "Unknown Job"}: ${app.status}`;
      }));
      return `Your application statuses:\n${appList.join("\n")}`;
    } else {
      return "You haven't applied to any jobs yet.";
    }
  }

  // Pattern for job details by ID
  const jobIdMatch = message.match(/details for job (\w+)/i);
  if (jobIdMatch) {
    const jobId = jobIdMatch[1];
    const job = await Job.findById(jobId);
    if (job && job.visible) {
      return `Job Details:\nTitle: ${job.title}\nLocation: ${job.location}\nCategory: ${job.category}\nLevel: ${job.level}\nSalary: $${job.salary}\nDescription: ${job.description}\nApply at /apply-job/${job._id}`;
    } else {
      return "No job found with that ID or job is not visible. Please check and try again.";
    }
  }

  return null;
};

const chatBot = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.auth?.userId;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // Try to handle with database first
    const dbResponse = await handleDatabaseQuery(message, userId);
    if (dbResponse) {
      return res.json({ success: true, response: dbResponse });
    }

    // Fallback to Gemini API with plain text prompt
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = `
      You are a helpful job assistant for a job portal called JobPortal.
      The portal uses Clerk for user authentication, so no account creation is needed if users are logged in.
      Respond concisely and directly to the user's query in plain text format, without any HTML tags.
      - For "How do I apply?": "To apply on JobPortal, find a job listing, click ‘Apply Now’, and upload your resume. If you’re logged in with Clerk, your profile is used. Need help finding a job?"
      - For greetings like 'Hi' or 'Hello': "Hi! I’m your JobPortal assistant. How can I help you today?"
      - For other queries, provide a helpful, concise response related to job searching or applications on JobPortal in plain text.
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