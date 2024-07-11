import { create } from "zustand";
import { api } from "../lib/axios"

interface Course {
  id: number
  modules: Array<{
    id: number
    title: string
    lessons: Array<{
      id: string
      title: string
      duration: string
    }>
  }>
}

export interface PlayerState {
  course: Course | null
  currentModuleIndex: number
  currentLessonIndex: number
  isLoading: boolean

  play: (moduleAndLessonIndex: [number, number]) => void
  next: () => void
  load: () => Promise<void>
}


// set = funcao que atualiza alguma informacao do estado
// get = uma funcao que busca informacao salva no estado
export const useStore = create<PlayerState>((set, get) => {
 return {
    course: null,
    currentModuleIndex: 0,
    currentLessonIndex: 0,
    isLoading: true,

    load: async() => {
      set({ isLoading: true})

      const response =  await api.get('/courses/1')

      set({ 
        course: response.data,
        isLoading: false,
      })
    },

    play: (moduleAndLessonIndex: [number, number]) => {
      const [moduleIndex, lessonIndex] = moduleAndLessonIndex
     
      set({
        currentModuleIndex: moduleIndex,
        currentLessonIndex: lessonIndex
      })
    },
    next: () => {
      const { currentLessonIndex, currentModuleIndex, course} = get()
     
      const nextLessonIndex = currentLessonIndex + 1
      const existNextLesson = course?.modules[currentModuleIndex].lessons[nextLessonIndex]

      if (existNextLesson) {
        set({ currentLessonIndex: nextLessonIndex}) 
      } else {
        const nextModuleIndex = currentModuleIndex + 1
        const existNextModule = course?.modules[nextModuleIndex]

        if (existNextModule) {
          set({currentModuleIndex: nextModuleIndex,
            currentLessonIndex: 0
          }) 
        }
      }
    }
  }


})

export const useCurrentLesson = () => {
  return  useStore(state => {
     const { currentLessonIndex, currentModuleIndex } = state
     // geting  data from the  current lesson 
     const currentModule = state.course?.modules[currentModuleIndex]
     const currentLesson = currentModule?.lessons[currentLessonIndex]
      
     return { currentModule, currentLesson }
   })
 }