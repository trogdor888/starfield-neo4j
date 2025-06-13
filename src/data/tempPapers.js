// Temporary file to store paper data
const tempPapers = [
  { id: "915", name: "国际学生活动 (UIC International Student Activities)", labels: ["Paper", "Activity"] },
  { id: "916", name: "The Nexus (SHSID)", labels: ["Paper", "Club"] },
  { id: "917", name: "学生会 (Student Council - SCIS)", labels: ["Paper", "Organization"] },
  { id: "918", name: "茱莉亚学院合作项目 (Juilliard Collaboration Projects)", labels: ["Paper", "Project"] },
  { id: "919", name: "Live 2 Drama (SHSID)", labels: ["Paper", "Club"] },
  { id: "920", name: "MIT合作STEAM项目 (MIT Collaboration STEAM Projects)", labels: ["Paper", "Project"] },
  { id: "921", name: "Phoenix Squadron Drone Club (Concordia Shanghai)", labels: ["Paper", "Club"] },
  { id: "922", name: "World Scholar's Cup (SHSID)", labels: ["Paper", "Competition"] },
  { id: "923", name: "ASDAN国际STEM挑战赛 (ASDAN International STEM Challenges)", labels: ["Paper", "Competition"] },
  { id: "924", name: "Social Responsibility", labels: ["Paper", "Concept"] },
  { id: "925", name: "Innovation", labels: ["Paper", "Concept"] }
];

// Function to generate more papers
const generateMorePapers = () => {
  const papers = [...tempPapers];
  const labels = ["Paper", "Activity", "Club", "Organization", "Project", "Competition", "Concept"];
  const activities = [
    "Science Fair",
    "Math Competition",
    "Debate Club",
    "Art Exhibition",
    "Music Festival",
    "Sports Tournament",
    "Cultural Exchange",
    "Research Project",
    "Community Service",
    "Environmental Initiative"
  ];
  
  for (let i = 926; i <= 2000; i++) {
    // Randomly select 1-3 labels for each paper
    const paperLabels = ["Paper"];
    const numLabels = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numLabels; j++) {
      const randomLabel = labels[Math.floor(Math.random() * (labels.length - 1)) + 1];
      if (!paperLabels.includes(randomLabel)) {
        paperLabels.push(randomLabel);
      }
    }
    
    // Generate a more meaningful name
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const school = ["SHSID", "SCIS", "Concordia", "UIC"][Math.floor(Math.random() * 4)];
    const name = `${activity} (${school})`;
    
    papers.push({
      id: i.toString(),
      name: name,
      labels: paperLabels
    });
  }
  return papers;
};

// Generate and export the papers
const allPapers = generateMorePapers();

// Export the papers
export default allPapers; 