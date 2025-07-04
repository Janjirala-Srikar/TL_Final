import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Notes from "../models/Notes.js";
import Quiz from "../models/Quiz.js";
import Course from "../models/Course.js";

// Always resolve from backend root
import process from "process";
const __dirname = process.cwd();

// Update directories for notes, quizzes, and images
const coreJavaDir = path.join(__dirname, "markdown-content", "CoreJava");
const notesDir = path.join(coreJavaDir, "CoreJava_Notes");
const quizzesDir = path.join(coreJavaDir, "CoreJava_Quiz");

// Predefined list of notes and quizzes
export const predefinedNotes = [
  {
    file: "CoreJava_BasicsAndDataTypes_Notes01.md",
    title: "Basics and Data Types",
  },
  {
    file: "CoreJava_ScannerInputAndKeywords_Notes02.md",
    title: "Scanner Input and Keywords",
  },
  {
    file: "CoreJava_ControlStatements_Notes0304.md",
    title: "Control Statements",
  },
  { file: "CoreJava_Arrays_Notes05.md", title: "Arrays" },
  { file: "CoreJava_StorageTypes_Notes06.md", title: "Storage Types" },
  { file: "CoreJava_Constructors_Notes07.md", title: "Constructors" },
  { file: "CoreJava_Inheritance_Notes08.md", title: "Inheritance" },
  {
    file: "CoreJava_AbstractClassAndInterface_Notes09.md",
    title: "Abstract Class and Interface",
  },
  {
    file: "CoreJava_ExceptionHandling_Notes10.md",
    title: "Exception Handling",
  },
  { file: "CoreJava_Multithreading_Notes11.md", title: "Multithreading" },
  {
    file: "CoreJava_CollectionFramework_Notes12.md",
    title: "Collection Framework",
  },
  { file: "CoreJava_MysqlDb_Notes1314.md", title: "MySQL Database" },
];

export const predefinedQuizzes = [
  {
    file: "CoreJava_BasicsAndDataTypes_Quiz01.md",
    title: "Basics and Data Types",
  },
  {
    file: "CoreJava_ScannerInputAndKeywords_Quiz02.md",
    title: "Scanner Input and Keywords",
  },
  {
    file: "CoreJava_ControlStatements_Quiz0304.md",
    title: "Control Statements",
  },
  { file: "CoreJava_Arrays_Quiz05.md", title: "Arrays" },
  { file: "CoreJava_StorageTypes_Quiz06.md", title: "Storage Types" },
  { file: "CoreJava_Constructors_Quiz07.md", title: "Constructors" },
  { file: "CoreJava_Inheritance_Quiz08.md", title: "Inheritance" },
  {
    file: "CoreJava_AbstractClassAndInterface_Quiz09.md",
    title: "Abstract Class and Interface",
  },
  { file: "CoreJava_ExceptionHandling_Quiz10.md", title: "Exception Handling" },
  { file: "CoreJava_Multithreading_Quiz11.md", title: "Multithreading" },
  {
    file: "CoreJava_CollectionFramework_Quiz12.md",
    title: "Collection Framework",
  },
  { file: "CoreJava_MysqlDb_Quiz1314.md", title: "MySQL Database" },
];

// Parser for ### Question ... format with - A) ... and **Answer:** X
const parseQuizMarkdown = (filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const questions = [];

  // Match both '### Question' and '### Question:'
  const questionRegex = /### Question:?([\s\S]*?)(?=### Question:?|$)/g;
  let match;
  while ((match = questionRegex.exec(content)) !== null) {
    const block = match[0];
    // Extract question text (first non-empty line after heading)
    const questionLine = block.match(/### Question:?\s*([\s\S]*?)(?:\n|$)/);
    const question = questionLine ? questionLine[1].trim() : null;
    // Extract options
    const options = [];
    const optionRegex = /^-\s*([A-D])\)\s*(.*)$/gm;
    let optMatch;
    while ((optMatch = optionRegex.exec(block)) !== null) {
      options.push(optMatch[2].trim());
    }
    // Extract answer
    const answerMatch = block.match(/\*\*Answer:\*\*\s*([A-D])/);
    if (!question || options.length < 2 || !answerMatch) {
      console.warn(
        `Skipped invalid question block in ${filePath}:\n${block}\n`
      );
      continue;
    }
    const correctLetter = answerMatch[1].toUpperCase();
    const correctAnswer = correctLetter.charCodeAt(0) - 65;
    if (correctAnswer >= 0 && correctAnswer < options.length) {
      questions.push({ question, options, correctAnswer });
    } else {
      console.warn(`Answer index out of range in ${filePath}:\n${block}\n`);
    }
  }
  return questions;
};

export const insertJavaMarkdownContent = async () => {
  try {
    // Only insert if Core Java course does not exist
    let coreJavaCourse = await Course.findOne({ title: "Core Java" });
    if (!coreJavaCourse) {
      // Create course and topics
      const coreJavaTopics = predefinedNotes.map((note) => ({
        title: note.title,
        notesId: null,
        quizId: null,
        exerciseId: null,
      }));
      coreJavaCourse = new Course({
        title: "Core Java",
        description: "Learn the fundamentals of Java programming.",
        level: "Beginner",
        topics: coreJavaTopics,
      });
      await coreJavaCourse.save();
      console.log("Core Java course seeded successfully");
    } else {
      console.log("Core Java course already exists, skipping course creation");
    }

    // Insert or update notes and always ensure correct linking
    let courseModified = false;
    for (const note of predefinedNotes) {
      const filePath = path.join(notesDir, note.file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        let existingNote = await Notes.findOne({ content });
        if (!existingNote) {
          existingNote = await Notes.create({ content });
        }
        const topic = coreJavaCourse.topics.find((t) => t.title === note.title);
        if (
          topic &&
          (!topic.notesId ||
            topic.notesId.toString() !== existingNote._id.toString())
        ) {
          topic.notesId = existingNote._id;
          courseModified = true;
        }
      } else {
        console.warn(`Note file not found: ${filePath}`);
      }
    }

    // Insert or update quizzes and always ensure correct linking
    let quizModified = false;
    for (const quiz of predefinedQuizzes) {
      const filePath = path.join(quizzesDir, quiz.file);
      if (fs.existsSync(filePath)) {
        const questions = parseQuizMarkdown(filePath);
        if (questions.length > 0) {
          const topic = coreJavaCourse.topics.find(
            (t) => t.title === quiz.title
          );
          if (!topic) continue;
          let existingQuiz = await Quiz.findOne({ topicTitle: quiz.title });
          if (!existingQuiz) {
            existingQuiz = await Quiz.create({
              courseId: coreJavaCourse._id,
              topicId: topic._id,
              topicTitle: quiz.title,
              questions,
            });
          }
          if (
            !topic.quizId ||
            topic.quizId.toString() !== existingQuiz._id.toString()
          ) {
            topic.quizId = existingQuiz._id;
            quizModified = true;
          }
        } else {
          console.warn(`No valid questions found in quiz: ${filePath}`);
        }
      } else {
        console.warn(`Quiz file not found: ${filePath}`);
      }
    }

    if (courseModified || quizModified) {
      await coreJavaCourse.save();
      console.log("Notes and quizzes linked to Core Java course successfully");
    } else {
      console.log(
        "Core Java notes and quizzes already linked, skipping update"
      );
    }
  } catch (error) {
    console.error("Error inserting markdown content:", error);
  }
};
