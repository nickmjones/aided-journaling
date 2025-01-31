import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Save, Lock, Unlock, RefreshCw } from 'lucide-react';
import { prompts } from '../lib/prompts';

const JournalApp = () => {
  const [title, setTitle] = useState('');
  const [answers, setAnswers] = useState(['', '', '']);
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [lockedPrompts, setLockedPrompts] = useState([false, false, false]);
  const [hasChanges, setHasChanges] = useState(false);

  // Get a random prompt that isn't already selected
  const getNewPrompt = (currentPrompts) => {
    const availablePrompts = prompts.filter(prompt => !currentPrompts.includes(prompt));
    return availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
  };

  // Re-roll a specific prompt
  const rerollPrompt = (index) => {
    if (!lockedPrompts[index]) {
      const newPrompts = [...selectedPrompts];
      newPrompts[index] = getNewPrompt(newPrompts);
      setSelectedPrompts(newPrompts);
      setHasChanges(true);
    }
  };

  // Toggle lock state for a prompt
  const toggleLock = (index) => {
    const newLocks = [...lockedPrompts];
    newLocks[index] = !newLocks[index];
    setLockedPrompts(newLocks);
  };

  // Generate three random prompts on initial load
  useEffect(() => {
    const initialPrompts = [];
    for (let i = 0; i < 3; i++) {
      initialPrompts.push(getNewPrompt(initialPrompts));
    }
    setSelectedPrompts(initialPrompts);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const savedEntry = localStorage.getItem('journalEntry');
    if (savedEntry) {
      const { title, answers, prompts, locks } = JSON.parse(savedEntry);
      setTitle(title);
      setAnswers(answers);
      setSelectedPrompts(prompts);
      if (locks) setLockedPrompts(locks);
    }
  }, []);

  // Save to localStorage when changes occur
  useEffect(() => {
    if (hasChanges) {
      localStorage.setItem('journalEntry', JSON.stringify({
        title,
        answers,
        prompts: selectedPrompts,
        locks: lockedPrompts
      }));
    }
  }, [title, answers, selectedPrompts, hasChanges, lockedPrompts]);

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
            <div className="flex items-center gap-2">
              <label className="flex-1 text-lg font-medium">{prompt}</label>
              <button
                onClick={() => rerollPrompt(index)}
                className={`p-2 rounded hover:bg-gray-100 transition-colors ${lockedPrompts[index] ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={lockedPrompts[index]}
                title={lockedPrompts[index] ? "Unlock to re-roll" : "Get new prompt"}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleLock(index)}
                className={`p-2 rounded hover:bg-gray-100 transition-colors ${lockedPrompts[index] ? 'text-blue-600' : ''}`}
                title={lockedPrompts[index] ? "Unlock prompt" : "Lock prompt"}
              >
                {lockedPrompts[index] ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>
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