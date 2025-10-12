import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  taskForm: FormGroup;
  editTaskId: string | null = null;
  filterStatus: 'all' | 'pending' | 'completed' = 'all';
  isLoading: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    console.log('🔍 DASHBOARD: ngOnInit started');
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    this.isLoading = true;
    console.log('🔄 DASHBOARD: isLoading set to TRUE');
    
    this.taskService.getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          console.log('✅ DASHBOARD: Tasks received in next():', tasks);
          console.log('✅ DASHBOARD: Tasks array?', Array.isArray(tasks));
          console.log('✅ DASHBOARD: Tasks length:', tasks?.length);
          
          this.tasks = tasks || [];
          console.log('✅ DASHBOARD: this.tasks set:', this.tasks);
          
          this.applyFilter();
          
          this.isLoading = false;
          console.log('✅ DASHBOARD: isLoading set to FALSE');
          this.cdr.detectChanges(); // Force UI update
        },
        error: (error) => {
          console.error('❌ DASHBOARD: Error in loadTasks:', error);
          this.tasks = [];
          this.filteredTasks = [];
          this.isLoading = false;
          console.log('✅ DASHBOARD: isLoading set to FALSE (error case)');
          this.cdr.detectChanges(); // Force UI update
        },
        complete: () => {
          console.log('✅ DASHBOARD: Observable completed');
        }
      });
  }

 applyFilter(): void {
  console.log('🔍 DASHBOARD: applyFilter called');
  console.log('🔍 DASHBOARD: this.tasks before filter:', this.tasks);
  console.log('🔍 DASHBOARD: filterStatus:', this.filterStatus);
  
  if (!this.tasks || !Array.isArray(this.tasks) || this.tasks.length === 0) {
    console.log('⚠️ DASHBOARD: No tasks to filter');
    this.filteredTasks = [];
    return;
  }

  // Create a new array reference to trigger change detection
  switch (this.filterStatus) {
    case 'pending':
      this.filteredTasks = this.tasks.filter(task => task.status === 'pending').slice();
      break;
    case 'completed':
      this.filteredTasks = this.tasks.filter(task => task.status === 'completed').slice();
      break;
    default:
      this.filteredTasks = [...this.tasks]; // This creates a new array reference
  }
  
  console.log('✅ DASHBOARD: filteredTasks after filter:', this.filteredTasks);
  console.log('✅ DASHBOARD: Total tasks:', this.tasks.length, 'Filtered:', this.filteredTasks.length);
}

  // ... rest of your methods remain the same
  onFilterChange(status: 'all' | 'pending' | 'completed'): void {
    this.filterStatus = status;
    this.applyFilter();
  }

  onSubmit(): void {
  if (this.taskForm.valid) {
    const taskData: CreateTaskRequest = this.taskForm.value;

    if (this.editTaskId) {
      // Update existing task
      this.taskService.updateTask(this.editTaskId, taskData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedTask) => {
            console.log('✅ DASHBOARD: Task updated response:', updatedTask);
            const index = this.tasks.findIndex(t => t._id === updatedTask._id);
            if (index !== -1) {
              this.tasks[index] = updatedTask;
              this.applyFilter();
            }
            this.resetForm();
          },
          error: (error) => {
            console.error('Error updating task:', error);
          }
        });
    } else {
      // Create new task
      console.log('🔄 DASHBOARD: Creating new task with data:', taskData);
      
      this.taskService.createTask(taskData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newTask) => {
            console.log('✅ DASHBOARD: New task response:', newTask);
            console.log('✅ DASHBOARD: New task type:', typeof newTask);
            console.log('✅ DASHBOARD: New task keys:', Object.keys(newTask));
            
            this.tasks.unshift(newTask);
            console.log('✅ DASHBOARD: Tasks after adding new task:', this.tasks);
            this.applyFilter();
            this.resetForm();
          },
          error: (error) => {
            console.error('Error creating task:', error);
          }
        });
    }
  }
}
  onEdit(task: Task): void {
    this.editTaskId = task._id!;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description
    });
  }


  onDelete(taskId: string): void {
  if (confirm('Are you sure you want to delete this task?')) {
    console.log('🔍 DASHBOARD: Deleting task with ID:', taskId);
    
    this.taskService.deleteTask(taskId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ DASHBOARD: Delete successful');
          
          // Remove the task from the local array
          this.tasks = this.tasks.filter(task => task._id !== taskId);
          this.applyFilter();
          
          // Force UI update
          this.cdr.detectChanges();
          console.log('✅ DASHBOARD: UI should update now');
        },
        error: (error) => {
          console.error('❌ DASHBOARD: Error deleting task:', error);
        }
      });
  }
}

 onToggleStatus(task: Task): void {
  const newStatus = task.status === 'pending' ? 'completed' : 'pending';
  console.log('🔄 DASHBOARD: Changing task status to:', newStatus);

  const updateData: UpdateTaskRequest = {
    status: newStatus
  };

  this.taskService.updateTask(task._id!, updateData)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (updatedTask) => {
        console.log('✅ DASHBOARD: Task status updated successfully');
        
        // Update the task in the main tasks array
        const index = this.tasks.findIndex(t => t._id === updatedTask._id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        
        // Reapply the filter to update filteredTasks
        this.applyFilter();
        
        // Force UI update
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ DASHBOARD: Error updating task status:', error);
      }
    });
}

  resetForm(): void {
    this.taskForm.reset();
    this.editTaskId = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get user() {
    return this.authService.getCurrentUser();
  }

  get pendingTasksCount(): number {
    if (!this.tasks || !Array.isArray(this.tasks)) return 0;
    return this.tasks.filter(task => task.status === 'pending').length;
  }

  get completedTasksCount(): number {
    if (!this.tasks || !Array.isArray(this.tasks)) return 0;
    return this.tasks.filter(task => task.status === 'completed').length;
  }
}