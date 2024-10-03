"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, MessageCircle, PenTool, Zap, Send, User, Bot, ChevronRight, ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const skillLevels = ["Beginner", "Intermediate", "Advanced"]

type ConversationEntry = {
  speaker: "User" | "AI"
  message: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

interface WordExercise {
  word: string;
  definition: string;
  exampleSentence: string;
}

interface GrammarExercise {
  question: string;
  options: string[];
  correctAnswer: string;
}

export function LanguageTutorComponent() {
  const [skillLevel, setSkillLevel] = useState<string>("Beginner")
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const [userInput, setUserInput] = useState<string>("")
  const [currentWord, setCurrentWord] = useState<string>("")
  const [currentExercise, setCurrentExercise] = useState<string>("")
  const [progress, setProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const conversationEndRef = useRef<HTMLDivElement>(null)
  const [currentWordExercise, setCurrentWordExercise] = useState<WordExercise | null>(null)
  const [currentGrammarExercise, setCurrentGrammarExercise] = useState<GrammarExercise | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null)
  const [wordError, setWordError] = useState<string | null>(null)
  const [isLoadingWord, setIsLoadingWord] = useState(false)
  const [wordExercises, setWordExercises] = useState<WordExercise[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  useEffect(() => {
    fetchWords()
    fetchExercise()
  }, [skillLevel])

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  const fetchWords = async () => {
    setIsLoadingWord(true)
    try {
      const response = await fetch(`${API_URL}/language-tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vocabulary', skillLevel }),
      })
      const data = await response.json()
      if (response.ok) {
        setWordExercises(data)
        setCurrentWordIndex(0)
        setWordError(null)
      } else {
        setWordError(data.error || 'Failed to fetch words')
        setWordExercises([])
      }
    } catch (error) {
      setWordError('Failed to fetch words')
      setWordExercises([])
    } finally {
      setIsLoadingWord(false)
    }
  }

  const fetchExercise = async () => {
    try {
      const response = await fetch(`${API_URL}/language-tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grammar', skillLevel }),
      })
      const data = await response.json()
      if (response.ok) {
        setCurrentGrammarExercise(data)
        setSelectedAnswer(null)
        setIsAnswerCorrect(null)
        setError(null) // Clear any previous errors
      } else {
        setError(data.error || 'Failed to fetch exercise')
        setCurrentGrammarExercise(null)
      }
    } catch (error) {
      setError('Failed to fetch exercise')
      setCurrentGrammarExercise(null)
    }
  }

  const handleConversationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim()) return

    try {
      const response = await fetch(`${API_URL}/language-tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'conversation', userInput }),
      })
      const data = await response.json()
      if (response.ok) {
        const newConversation: ConversationEntry[] = [
          ...conversation,
          { speaker: "User", message: userInput },
          { speaker: "AI", message: data.message },
        ]
        setConversation(newConversation)
        setUserInput("")
        updateProgress()
      } else {
        setError(data.error || 'Failed to get AI response')
      }
    } catch (error) {
      setError('Failed to get AI response')
    }
  }

  const handleNextWord = () => {
    if (currentWordIndex < wordExercises.length - 1) {
      setCurrentWordIndex(prevIndex => prevIndex + 1)
    } else {
      fetchWords()
    }
    updateProgress()
  }

  const handleNextExercise = () => {
    fetchExercise()
    updateProgress()
  }

  const updateProgress = () => {
    setProgress((prevProgress) => Math.min(prevProgress + 10, 100))
  }

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleAnswerSubmit = () => {
    if (currentGrammarExercise && selectedAnswer) {
      const isCorrect = selectedAnswer === currentGrammarExercise.correctAnswer;
      setIsAnswerCorrect(isCorrect);
      if (isCorrect) {
        updateProgress();
      }
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
      >
        AI Language Tutor
      </motion.h1>
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-red-500 mb-4 p-4 bg-red-100 rounded-md shadow-md"
        >
          {error}
        </motion.div>
      )}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg"
      >
        <label htmlFor="skill-level" className="block text-sm font-medium text-neutral-500 mb-2 dark:text-neutral-400">
          Select Your Skill Level
        </label>
        <Select value={skillLevel} onValueChange={setSkillLevel}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select skill level" />
          </SelectTrigger>
          <SelectContent>
            {skillLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
      <Tabs defaultValue="conversation" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-full">
          <TabsTrigger value="conversation" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-white">
            <MessageCircle className="w-4 h-4 mr-2" />
            Conversation
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-white">
            <BookOpen className="w-4 h-4 mr-2" />
            Vocabulary
          </TabsTrigger>
          <TabsTrigger value="grammar" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-neutral-700 dark:data-[state=active]:text-white">
            <PenTool className="w-4 h-4 mr-2" />
            Grammar
          </TabsTrigger>
        </TabsList>
        <TabsContent value="conversation">
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardTitle className="flex items-center text-2xl">
                <MessageCircle className="w-6 h-6 mr-2" />
                Conversation Practice
              </CardTitle>
              <CardDescription className="text-blue-100">Enhance your language skills through interactive dialogue.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4 h-80 overflow-y-auto border border-neutral-200 rounded-md p-4 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50">
                {conversation.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-3 p-3 rounded-lg flex items-start ${
                      entry.speaker === "AI" ? "bg-blue-100 dark:bg-blue-900/50" : "bg-green-100 dark:bg-green-900/50"
                    }`}
                  >
                    <div className={`w-8 h-8 mr-2 rounded-full flex items-center justify-center ${
                      entry.speaker === "AI" ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                    }`}>
                      {entry.speaker === "AI" ? "AI" : "You"}
                    </div>
                    <div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        entry.speaker === "AI" ? "bg-blue-200 text-blue-800" : "bg-green-200 text-green-800"
                      }`}>
                        {entry.speaker}
                      </span>
                      <p className="text-neutral-800 dark:text-neutral-200 mt-1">{entry.message}</p>
                    </div>
                  </motion.div>
                ))}
                <div ref={conversationEndRef} />
              </div>
              <form onSubmit={handleConversationSubmit} className="flex gap-2">
                <Input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow"
                />
                <Button type="submit" className="px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vocabulary">
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
              <CardTitle className="flex items-center text-2xl">
                <BookOpen className="w-6 h-6 mr-2" />
                Vocabulary Building
              </CardTitle>
              <CardDescription className="text-green-100">Expand your vocabulary with words tailored to your skill level.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {wordError ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-red-500 mb-4 p-4 bg-red-100 rounded-md"
                >
                  {wordError}
                </motion.div>
              ) : wordExercises.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 p-6 rounded-lg shadow-inner"
                >
                  <div className="text-4xl font-bold text-center text-green-600 dark:text-green-400">{wordExercises[currentWordIndex].word}</div>
                  <div className="text-lg"><span className="font-semibold">Definition:</span> {wordExercises[currentWordIndex].definition}</div>
                  <div className="text-lg"><span className="font-semibold">Example:</span> {wordExercises[currentWordIndex].exampleSentence}</div>
                  <div className="text-sm text-neutral-500 text-center">Word {currentWordIndex + 1} of {wordExercises.length}</div>
                </motion.div>
              ) : (
                <div className="text-center p-4">Loading word exercises...</div>
              )}
              <div className="flex justify-between mt-6">
                <Button onClick={() => setCurrentWordIndex(prev => Math.max(0, prev - 1))} disabled={currentWordIndex === 0 || isLoadingWord} className="px-4 bg-green-500 hover:bg-green-600">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={handleNextWord} className="px-4 bg-green-500 hover:bg-green-600" disabled={isLoadingWord}>
                  {isLoadingWord ? 'Loading...' : currentWordIndex < wordExercises.length - 1 ? 'Next' : 'New Set'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="grammar">
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="flex items-center text-2xl">
                <PenTool className="w-6 h-6 mr-2" />
                Grammar Exercises
              </CardTitle>
              <CardDescription className="text-purple-100">Sharpen your grammar skills with interactive exercises.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {error ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-red-500 mb-4 p-4 bg-red-100 rounded-md"
                >
                  {error}
                </motion.div>
              ) : currentGrammarExercise ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="text-lg font-semibold bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg shadow-inner">{currentGrammarExercise.question}</div>
                  <div className="space-y-2">
                    {currentGrammarExercise.options.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => setSelectedAnswer(option)}
                        variant={selectedAnswer === option ? "default" : "outline"}
                        className="w-full justify-start transition-all duration-200 ease-in-out transform hover:scale-105"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                  <Button onClick={handleAnswerSubmit} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" disabled={!selectedAnswer}>
                    Submit Answer
                  </Button>
                  {isAnswerCorrect !== null && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`text-center font-semibold p-4 rounded-lg ${isAnswerCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {isAnswerCorrect ? 'Correct!' : (
                        <>
                          <p>Incorrect. Try again!</p>
                          <p className="mt-2">The correct answer is: <span className="font-bold">{currentGrammarExercise.correctAnswer}</span></p>
                        </>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center p-4">Loading grammar exercise...</div>
              )}
              <div className="flex justify-center mt-6">
                <Button onClick={handleNextExercise} className="px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  Next Exercise
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <CardTitle className="flex items-center text-2xl">
            <Zap className="w-6 h-6 mr-2" />
            Your Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative w-full h-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center mt-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">{progress}% Complete</p>
        </CardContent>
      </Card>
    </div>
  )
}
