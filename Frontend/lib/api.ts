const API_BASE = "http://localhost:8080"

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
}

export async function api<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options

  const config: RequestInit = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const url = `${API_BASE}${endpoint}`
  console.log("[v0] API Request:", method, url, body)

  try {
    const response = await fetch(url, config)
    console.log("[v0] API Response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Error response:", errorText)
      try {
        const parsed = JSON.parse(errorText) as { message?: string }
        throw new Error(parsed.message || errorText || "Something went wrong")
      } catch {
        throw new Error(errorText || "Something went wrong")
      }
    }

    const data = await response.json()
    console.log("[v0] API Response data:", data)
    return data
  } catch (error) {
    console.error("[v0] API Fetch error:", error)
    throw error
  }
}

// Auth APIs
export const authApi = {
  register: (data: { name: string; phone: string; role: "CUSTOMER" | "WORKER"; language?: string }) =>
    api<User>("/auth/register", {
      method: "POST",
      body: { ...data, language: data.language || "en" },
    }),
  login: (phone: string) =>
    api<User>("/auth/login", { method: "POST", body: { phone } }),
  logout: () => api<{ message: string }>("/auth/logout", { method: "POST" }),
}

// Category APIs
export const categoryApi = {
  getAll: () => api<Category[]>("/category/all"),
}

// Worker APIs
export const workerApi = {
  getNearby: (lat: number, lng: number, categoryId: number, radiusKm = 10) =>
    api<BackendWorkerProfile[]>(`/worker/nearby?lat=${lat}&lng=${lng}&categoryId=${categoryId}&radiusKm=${radiusKm}`).then(
      (profiles) => profiles.map(mapWorkerFromProfile),
    ),
  createProfile: (userId: number, categoryId: number) =>
    api<BackendWorkerProfile>("/worker/profile/create", { method: "POST", body: { userId, categoryId } }).then(
      mapWorkerProfile,
    ),
  toggleAvailability: (userId: number, isAvailable: boolean) =>
    api<BackendWorkerProfile>("/worker/availability", { method: "POST", body: { userId, isAvailable } }).then(
      mapWorkerProfile,
    ),
}

// Location APIs
export const locationApi = {
  update: (userId: number, latitude: number, longitude: number) =>
    api<void>("/location/update", { method: "POST", body: { userId, latitude, longitude } }),
}

// Job APIs
export const jobApi = {
  create: (customerId: number, workerId: number, categoryId: number) =>
    api<Job>("/job/create", { method: "POST", body: { customerId, workerId, categoryId } }),
  getByUser: (userId: number) =>
    api<BackendJob[]>(`/job/user/${userId}`).then((jobs) => jobs.map(mapJob)),
}

// Types
export interface User {
  id: number
  name: string
  phone: string
  role: "CUSTOMER" | "WORKER"
  language?: string
}

export interface Category {
  id: number
  name: string
  basePrice: number
}

export interface Worker {
  id: number
  name: string
  category: string
  categoryId: number
  rating: number
  totalJobs?: number
  available: boolean
}

export interface WorkerProfile {
  id: number
  userId: number
  categoryId: number
  available: boolean
  rating: number
  totalJobs: number
}

export interface Job {
  id: number
  customerId: number
  workerId: number
  workerName?: string
  customerName?: string
  categoryName?: string
  categoryId: number
  status: "REQUESTED" | "ACCEPTED" | "COMPLETED" | "CANCELLED"
  price?: number
}

interface BackendWorkerProfile {
  id: number
  user: User
  category: Category
  isAvailable?: boolean
  available?: boolean
  rating: number
  totalJobs: number
}

interface BackendJob {
  id: number
  customer: User
  worker: User | null
  category: Category
  status: "REQUESTED" | "ACCEPTED" | "COMPLETED" | "CANCELLED"
  price?: number
}

function getAvailability(profile: BackendWorkerProfile): boolean {
  if (typeof profile.available === "boolean") return profile.available
  if (typeof profile.isAvailable === "boolean") return profile.isAvailable
  return false
}

function mapWorkerFromProfile(profile: BackendWorkerProfile): Worker {
  return {
    id: profile.user.id,
    name: profile.user.name,
    category: profile.category.name,
    categoryId: profile.category.id,
    rating: profile.rating,
    totalJobs: profile.totalJobs,
    available: getAvailability(profile),
  }
}

function mapWorkerProfile(profile: BackendWorkerProfile): WorkerProfile {
  return {
    id: profile.id,
    userId: profile.user.id,
    categoryId: profile.category.id,
    available: getAvailability(profile),
    rating: profile.rating,
    totalJobs: profile.totalJobs,
  }
}

function mapJob(job: BackendJob): Job {
  return {
    id: job.id,
    customerId: job.customer.id,
    workerId: job.worker?.id ?? 0,
    workerName: job.worker?.name,
    customerName: job.customer.name,
    categoryId: job.category.id,
    categoryName: job.category.name,
    status: job.status,
    price: job.price,
  }
}
