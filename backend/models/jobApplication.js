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
      const jobList = jobs.map(job => `<li>${job.title} in ${job.location} (Category: ${job.category}, Level: ${job.level}) - <a href="/apply-job/${job._id}">Apply Now</a></li>`).join("");
      return `<p>Here are some ${jobTitle} jobs in ${location}:</p><ul>${jobList}</ul>`;
    } else {
      return `<p>No ${jobTitle} jobs found in ${location}. Try a different search.</p>`;
    }
  }

  // Pattern for finding jobs by location
  const locationMatch = message.match(/find jobs in (.+)$/i);
  if (locationMatch) {
    const location = locationMatch[1].trim();
    const jobs = await Job.find({ location: { $regex: location, $options: 'i' }, visible: true }).limit(5);
    if (jobs.length > 0) {
      const jobList = jobs.map(job => `<li>${job.title} in ${job.location} (Category: ${job.category}, Level: ${job.level}) - <a href="/apply-job/${job._id}">Apply Now</a></li>`).join("");
      return `<p>Here are some jobs in ${location}:</p><ul>${jobList}</ul>`;
    } else {
      return `<p>No jobs found in ${location}. Try a different location or check back later.</p>`;
    }
  }

  // Pattern for finding jobs by title
  const jobTitleMatch = message.match(/show me (.+) jobs$/i);
  if (jobTitleMatch) {
    const jobTitle = jobTitleMatch[1].trim();
    const jobs = await Job.find({ title: { $regex: jobTitle, $options: 'i' }, visible: true }).limit(5);
    if (jobs.length > 0) {
      const jobList = jobs.map(job => `<li>${job.title} in ${job.location} (Category: ${job.category}, Level: ${job.level}) - <a href="/apply-job/${job._id}">Apply Now</a></li>`).join("");
      return `<p>Here are some ${jobTitle} jobs:</p><ul>${jobList}</ul>`;
    } else {
      return `<p>No ${jobTitle} jobs found. Try a different title or check back later.</p>`;
    }
  }

  // Pattern for latest jobs
  if (message.toLowerCase().includes("latest jobs")) {
    const latestJobs = await Job.find({ visible: true }).sort({ date: -1 }).limit(5);
    const jobList = latestJobs.map(job => `<li>${job.title} in ${job.location} (Category: ${job.category}, Level: ${job.level}) - <a href="/apply-job/${job._id}">Apply Now</a></li>`).join("");
    return `<p>Here are the latest job postings:</p><ul>${jobList}</ul>`;
  }

  // Pattern for application status
  if (message.toLowerCase().includes("application status")) {
    if (!userId) {
      return "<p>Please log in to check your application status.</p>";
    }
    const applications = await JobApplication.find({ userId });
    if (applications.length > 0) {
      const appList = await Promise.all(applications.map(async app => {
        const job = await Job.findById(app.jobId); // Corrected to findById for single document
        return `<li>${job ? job.title : "Unknown Job"}: ${app.status}</li>`;
      }));
      return `<p>Your application statuses:</p><ul>${appList.join('')}</ul>`;
    } else {
      return "<p>You haven't applied to any jobs yet.</p>";
    }
  }

  // Pattern for job details by ID
  const jobIdMatch = message.match(/details for job (\w+)/i);
  if (jobIdMatch) {
    const jobId = jobIdMatch[1];
    const job = await Job.findById(jobId); // Corrected to findById for single document
    if (job && job.visible) {
      return `<p>Job Details:</p><ul><li>Title: ${job.title}</li><li>Location: ${job.location}</li><li>Category: ${job.category}</li><li>Level: ${job.level}</li><li>Salary: $${job.salary}</li><li>Description: ${job.description}</li></ul><a href="/apply-job/${job._id}">Apply Now</a>`;
    } else {
      return "<p>No job found with that ID or job is not visible. Please check and try again.</p>";
    }
  }

  return null; // No database query matched
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

    // Fallback to Gemini API
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