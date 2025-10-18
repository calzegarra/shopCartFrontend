import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';

import { Employee } from '../../model/employee.model';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  // 👇 importante: todos los componentes standalone y módulos requeridos van aquí
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    DatePickerModule,
    FloatLabelModule,
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent {
  employees = signal<Employee[]>([]);
  saving = false;
  saved = false;

  model: Employee = {
    id: 0,
    name: '',
    lastname: '',
    role: '',
    department: 'IT',
    hireDate: '',
    status: 'ACTIVE'
  };

  hireDate: Date | null = new Date();

  departments = ['IT', 'HR', 'Sales', 'Operations', 'Finance'].map(d => ({
    label: d,
    value: d
  }));

  statuses = [
    { label: 'Activo', value: 'ACTIVE' },
    { label: 'Inactivo', value: 'INACTIVE' }
  ];

  constructor(private service: EmployeeService) {
    this.load();
  }

  load() {
    this.service.findAll().subscribe(list => this.employees.set(list));
  }

  save(formRef: any) {
    if (!formRef.valid) return;
    this.saving = true;

    const nextId =
      (Math.max(0, ...this.employees().map(e => e.id || 0)) + 1) || 1;

    const dateStr = this.hireDate
      ? new Date(this.hireDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    const newEmp: Employee = { ...this.model, id: nextId, hireDate: dateStr };
    const list = [...this.employees(), newEmp];

    this.employees.set(list);
    this.saving = false;
    this.saved = true;

    setTimeout(() => (this.saved = false), 2000);
    this.reset();
  }

  reset() {
    this.model = {
      id: 0,
      name: '',
      lastname: '',
      role: '',
      department: 'IT',
      hireDate: '',
      status: 'ACTIVE'
    };
    this.hireDate = new Date();
  }
}
