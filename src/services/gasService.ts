import { Student, RaceResult, HousePoints, House } from '../types';

// Declare the global 'google' object provided by Apps Script environment
declare const google: any;

const isGasEnv = typeof google !== 'undefined' && google.script && google.script.run;

const STORAGE_KEY_STUDENTS = 'llst_students';
const STORAGE_KEY_RESULTS = 'llst_results';

// Mock Data for Preview
const initialStudents: Student[] = [
  { id: '1', name: 'John Doe', house: 'Blue', points: 10 },
  { id: '2', name: 'Jane Smith', house: 'Red', points: 15 },
  { id: '3', name: 'Bob Wilson', house: 'Yellow', points: 5 },
];

const getStoredStudents = (): Student[] => {
  const stored = localStorage.getItem(STORAGE_KEY_STUDENTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(initialStudents));
    return initialStudents;
  }
  return JSON.parse(stored);
};

const getStoredResults = (): RaceResult[] => {
  const stored = localStorage.getItem(STORAGE_KEY_RESULTS);
  return stored ? JSON.parse(stored) : [];
};

export const gasService = {
  getStudents: async (): Promise<Student[]> => {
    if (isGasEnv) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .getStudents();
      });
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    return getStoredStudents();
  },

  addStudent: async (name: string, house: House): Promise<Student> => {
    if (isGasEnv) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .addStudent(name, house);
      });
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    const students = getStoredStudents();
    const newStudent: Student = { id: Date.now().toString(), name, house, points: 0 };
    students.push(newStudent);
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    return newStudent;
  },

  updateStudent: async (id: string, newName: string): Promise<void> => {
    if (isGasEnv) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .updateStudent(id, newName);
      });
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    const students = getStoredStudents();
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index].name = newName;
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    }
  },

  saveRaceResult: async (result: Omit<RaceResult, 'id' | 'timestamp'>): Promise<void> => {
    if (isGasEnv) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .saveRaceResult(result);
      });
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    const results = getStoredResults();
    const newResult: RaceResult = { ...result, id: Date.now().toString(), timestamp: new Date().toISOString() };
    results.push(newResult);
    localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(results));
    
    const students = getStoredStudents();
    const student = students.find(s => s.name === result.athleteName);
    if (student) {
      student.points += 5;
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    }
  },

  getHousePoints: async (): Promise<HousePoints> => {
    if (isGasEnv) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .getHousePoints();
      });
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    const students = getStoredStudents();
    const totals: HousePoints = { Blue: 0, Red: 0, Yellow: 0 };
    students.forEach(s => { totals[s.house] += s.points; });
    return totals;
  }
};
