export interface UseCaseConfig {
  id: string;
  name: string;
  description: string;
  userLabel: string;
  userLabelSingular: string;
  expenseContext: string;
  dashboardTitle: string;
  terminology: {
    user: string;
    users: string;
    userManagement: string;
    addUser: string;
    editUser: string;
    selectUser: string;
    allUsers: string;
    userFilter: string;
  };
}

export const useCaseConfigs: Record<string, UseCaseConfig> = {
  'family-expenses': {
    id: 'family-expenses',
    name: 'Family Expenses',
    description: 'Track household expenses for family members with shared budgets and responsibilities',
    userLabel: 'Family Members',
    userLabelSingular: 'Family Member',
    expenseContext: 'Track who spent what on family needs and activities',
    dashboardTitle: 'Family Expense Dashboard',
    terminology: {
      user: 'family member',
      users: 'family members',
      userManagement: 'Family Member Management',
      addUser: 'Add Family Member',
      editUser: 'Edit Family Member',
      selectUser: 'Select Family Member',
      allUsers: 'All Family Members',
      userFilter: 'Filter by family member'
    }
  },
  'personal-team': {
    id: 'personal-team',
    name: 'Team Expenses',
    description: 'Track expenses for team members or employees',
    userLabel: 'Team Members',
    userLabelSingular: 'Team Member',
    expenseContext: 'Track who spent what and where',
    dashboardTitle: 'Team Expense Dashboard',
    terminology: {
      user: 'team member',
      users: 'team members',
      userManagement: 'Team Member Management',
      addUser: 'Add Team Member',
      editUser: 'Edit Team Member',
      selectUser: 'Select Team Member',
      allUsers: 'All Team Members',
      userFilter: 'Filter by team member'
    }
  },
  'project-based': {
    id: 'project-based',
    name: 'Project-Based Tracking',
    description: 'Track expenses associated with specific projects or jobs',
    userLabel: 'Projects',
    userLabelSingular: 'Project',
    expenseContext: 'Track project costs and budget allocation',
    dashboardTitle: 'Project Expense Dashboard',
    terminology: {
      user: 'project',
      users: 'projects',
      userManagement: 'Project Management',
      addUser: 'Add Project',
      editUser: 'Edit Project',
      selectUser: 'Select Project',
      allUsers: 'All Projects',
      userFilter: 'Filter by project'
    }
  },
  'department-based': {
    id: 'department-based',
    name: 'Department Tracking',
    description: 'Track expenses by department or business unit',
    userLabel: 'Departments',
    userLabelSingular: 'Department',
    expenseContext: 'Track departmental spending and budgets',
    dashboardTitle: 'Department Expense Dashboard',
    terminology: {
      user: 'department',
      users: 'departments',
      userManagement: 'Department Management',
      addUser: 'Add Department',
      editUser: 'Edit Department',
      selectUser: 'Select Department',
      allUsers: 'All Departments',
      userFilter: 'Filter by department'
    }
  },
  'client-based': {
    id: 'client-based',
    name: 'Client Account Tracking',
    description: 'Track expenses by client account or customer',
    userLabel: 'Client Accounts',
    userLabelSingular: 'Client Account',
    expenseContext: 'Track client-specific expenses for billing',
    dashboardTitle: 'Client Account Dashboard',
    terminology: {
      user: 'client account',
      users: 'client accounts',
      userManagement: 'Client Account Management',
      addUser: 'Add Client Account',
      editUser: 'Edit Client Account',
      selectUser: 'Select Client Account',
      allUsers: 'All Client Accounts',
      userFilter: 'Filter by client account'
    }
  },
  'location-based': {
    id: 'location-based',
    name: 'Location-Based Tracking',
    description: 'Track expenses by office location or facility',
    userLabel: 'Locations',
    userLabelSingular: 'Location',
    expenseContext: 'Track location-specific operational costs',
    dashboardTitle: 'Location Expense Dashboard',
    terminology: {
      user: 'location',
      users: 'locations',
      userManagement: 'Location Management',
      addUser: 'Add Location',
      editUser: 'Edit Location',
      selectUser: 'Select Location',
      allUsers: 'All Locations',
      userFilter: 'Filter by location'
    }
  }
};

export function getUseCaseConfig(useCaseId: string): UseCaseConfig {
  return useCaseConfigs[useCaseId] || useCaseConfigs['family-expenses'];
}

export function getUseCaseTerminology(useCaseId: string) {
  const config = getUseCaseConfig(useCaseId);
  return config.terminology;
}