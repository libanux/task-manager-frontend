import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.model';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Helper method to create headers with authorization token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Get all tasks for the logged-in user
 getTasks(): Observable<Task[]> {
  console.log('🔍 TASK SERVICE: Getting tasks...');
  
  return this.http.get<{success: boolean, message: string, data: Task[]}>(`${this.apiUrl}/tasks`, {  
    headers: this.getHeaders()
  }).pipe(
    map(response => {
      console.log('🔍 TASK SERVICE: Full response:', response);
      
      if (response.success && Array.isArray(response.data)) {
        console.log('✅ TASK SERVICE: Tasks retrieved successfully, count:', response.data.length);
        return response.data;
      } else {
        console.warn('⚠️ TASK SERVICE: No tasks found or unexpected format');
        return [];
      }
    })
  );
}

  /*Note:Request WITHOUT headers:

GET /api/tasks
(No identity, no language specified)
↓
Backend: "Who are you? I can't show you tasks!"
Response: 401 Unauthorized.




So the complete flow:
getHeaders() creates header object

http.get(url, { headers }) sends headers with request

Backend receives headers and authenticates you




Authorization: Bearer ${token}

What: Your ID card for the backend

Purpose: Proves who you are

Without it: Backend says "I don't know you - ACCESS DENIED!"

Content-Type: application/json

What: Language you're speaking to backend

Purpose: Tells backend "I'm sending JSON data"

Without it: Backend might not understand your data
 */

  // Create a new task
  createTask(taskData: CreateTaskRequest): Observable<Task> {
  console.log('🔍 TASK SERVICE: Creating task:', taskData);
  
  return this.http.post<{success: boolean, message: string, data: Task}>(`${this.apiUrl}/tasks`, taskData, {
    headers: this.getHeaders()
  }).pipe(
    map(response => {
      console.log('✅ TASK SERVICE: Task created:', response.data);
      return response.data;
    })
  );
}

  // Update an existing task
 updateTask(taskId: string, updateData: UpdateTaskRequest): Observable<Task> {
  console.log('🔍 TASK SERVICE: Updating task:', taskId, updateData);
  
  return this.http.put<{success: boolean, message: string, data: Task}>(`${this.apiUrl}/tasks/${taskId}`, updateData, {
    headers: this.getHeaders()
  }).pipe(
    map(response => {
      console.log('✅ TASK SERVICE: Task updated:', response.data);
      return response.data;
    })
  );
}
  // Delete a task
 deleteTask(id: string): Observable<{success: boolean, message: string}> {
  console.log('🔍 TASK SERVICE: Deleting task with ID:', id);
  
  return this.http.delete<{success: boolean, message: string}>(`${this.apiUrl}/tasks/${id}`, {
    headers: this.getHeaders()
  });
}


    /*void means: No data returns, just success confirmation. 
    The operation completes but sends nothing back.

    Example: DELETE task → backend deletes 
    it → returns empty → frontend knows it worked. */
  }
