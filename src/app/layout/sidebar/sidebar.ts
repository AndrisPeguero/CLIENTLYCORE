import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideCalendar,
  LucideDynamicIcon,
  LucideFileText,
  LucideLayoutDashboard,
  LucidePackage,
  LucideUsers,
  type LucideIcon,
} from '@lucide/angular';

interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideDynamicIcon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  navItems: NavigationItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: LucideLayoutDashboard },
    { label: 'Clients', path: '/clients', icon: LucideUsers },
    { label: 'Contracted Services', path: '/contracted-services', icon: LucideFileText },
    { label: 'Service Catalog', path: '/service-catalog', icon: LucidePackage },
    { label: 'Contract Types', path: '/contract-types', icon: LucideCalendar },
  ];
}