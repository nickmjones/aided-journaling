import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Save } from 'lucide-react';

const prompts = [
  "What made you smile today?",
  "What's one thing you learned today?",
  "What's something you're looking forward to?",
  "What's a challenge you faced today?",
  "What's something you're grateful for?",
  "What's something you'd like to improve?",
  "What's a conversation that stuck with you today?",
  "What's something that surprised you today?",
  "What's a small win you had today?",
  "What's something you want to remember about today?",
  "What's something you did today that you're proud of?",
  "What's something that challenged your assumptions today?",
  "What's a moment of peace you experienced today?",
  "What's something you'd do differently if you could?",
  "What's something that inspired you today?",
  "What's a question you're pondering?",
  "What's something you noticed about yourself today?",
  "What's something you want to explore further?",
  "What's a decision you made today?",
  "What's something that energized you today?",
  "What's something that drained your energy today?",
  "What's a boundary you maintained today?",
  "What's something you're curious about?",
  "What's a habit you're working on?",
  "What's something you need to let go of?",
  "What's something you're excited about?",
  "What's something you want to celebrate?",
  "What's something you're processing?",
  "What's something you observed about others today?",
  "What's something you want to remember for tomorrow?"
];

const JournalApp = () => {
  const [title, setTitle] = useState('');
  const [answers, setAnswers] = useState(['', '', '']);
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Generate three random prompts on initial load
  useEffect(() => {
    const getRandomPrompts = () => {
      const shuffled = [...prompts].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    };
    setSelectedPrompts(getRandomPrompts());
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const savedEntry = localStorage.getItem('journalEntry');
    if (savedEntry) {
      const { title, answers, prompts } = JSON.parse(savedEntry);
      setTitle(title);
      setAnswers(answers);
      setSelectedPrompts(prompts);
    }
  }, []);

  // Save to localStorage when changes occur
  useEffect(() => {
    if (hasChanges) {
      localStorage.setItem('journalEntry', JSON.stringify({
        title,
        answers,
        prompts: selectedPrompts
      }));
    }
  }, [title, answers, selectedPrompts, hasChanges]);

  // Handle input changes
  const handleChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    setHasChanges(true);
  };

  // Generate markdown
  const generateMarkdown = () => {
    const date = new Date();
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;
    
    // Sanitize title: remove special characters and replace spaces with hyphens
    const sanitizedTitle = title
      ? title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
        .trim()
      : '';
    
    const fileName = `${sanitizedTitle ? sanitizedTitle + '-' : ''}${formattedDate}.md`;
    
    let markdown = `# ${title || formattedDate}\n\n`;
    selectedPrompts.forEach((prompt, index) => {
      markdown += `## ${prompt}\n\n${answers[index] || '*No response*'}\n\n`;
    });

    // Create and download markdown file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Clear localStorage after successful save
    localStorage.removeItem('journalEntry');
    setHasChanges(false);
  };

  // Handle page refresh/exit
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Optional title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setHasChanges(true);
          }}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {selectedPrompts.map((prompt, index) => (
          <div key={index} className="space-y-2">
            <label className="block text-lg font-medium">{prompt}</label>
            <textarea
              value={answers[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-full p-2 border rounded min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write your response here..."
            />
          </div>
        ))}
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button 
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition-colors"
            disabled={!hasChanges || answers.every(a => !a.trim())}
          >
            <Save className="w-5 h-5" />
            <span>Generate Markdown</span>
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate a markdown file for your journal entry. Would you like to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={generateMarkdown}>
              Save Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JournalApp;