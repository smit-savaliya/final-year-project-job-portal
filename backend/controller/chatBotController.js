import Job from "../models/Job.js";
const chatBot = async(req , res)=>{

    // try {
    //     const { message } = req.body;
    
    //     if (!message) {
    //       return res.status(400).json({ success: false, message: "Message is required" });
    //     }
    
    //     // Initialize Gemini API
    //     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    //     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    //     // System prompt to make the bot a job assistant
    //     const prompt = `You are a helpful job assistant for a job portal. Answer the user's query: ${message}`;
    //     const response = await model.generateContent(prompt);
    //     const botResponse = response.response.text();
    
    //     res.json({ success: true, response: botResponse });
    //   } catch (error) {
    //     console.error("Gemini API error:", error.message);
    //     res.status(500).json({ success: false, message: error.message });
    //   }
    try {
        const { message } = req.body;
    
        if (!message) {
          return res.status(400).json({ success: false, message: "Message is required" });
        }
    
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
        let prompt = `
          You are a helpful job assistant for a job portal called JobPortal.
          The portal uses Clerk for user authentication, so no account creation is needed if users are logged in.
          Respond concisely and directly to the user's query based on the following guidelines:
          - For "How do I apply?": "To apply on JobPortal, find a job listing, click ‘Apply Now’, and upload your resume. If you’re logged in with Clerk, your profile is used. Need help finding a job?"
          - For greetings like 'Hi' or 'Hello': "Hi! I’m your JobPortal assistant. How can I help you today?"
        `;
    
        if (message.toLowerCase().includes("what jobs") || message.toLowerCase().includes("find jobs")) {
          const jobs = await Job.find({}).limit(3); // Fetch jobs from MongoDB
          const jobList = jobs.map(job => `- ${job.title} in ${job.location}`).join("\n") || "No jobs available.";
          prompt += `\nCurrent job listings: ${jobList}\nProvide a helpful response based on the job listings.`;
        }
    
        prompt += `\nUser query: ${message}`;
        const result = await model.generateContent(prompt);
        const botResponse = result.response.text();
    
        res.json({ success: true, response: botResponse });
      } catch (error) {
        console.error("Gemini API error:", error.message);
        res.status(500).json({ success: false, message: error.message });
      }
}
export default chatBot