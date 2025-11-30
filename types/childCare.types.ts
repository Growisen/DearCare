export interface ChildCareFormData {
  numberOfChildren: string;
  agesOfChildren: string;
  careNeeds: {
    infantCare: boolean;
    youngChildCare: boolean;
    schoolAgeSupport: boolean;
    specialNeeds: boolean;
    healthIssues: boolean;
  };
  careNeedsDetails: string;
  notes: string;
  primaryFocus: 'child_care_priority' | 'both_equal';
  homeTasks: {
    laundry: boolean;
    mealPrep: boolean;
    tidyAreas: boolean;
    washDishes: boolean;
    generalTidyUp: boolean;
    other: boolean;
  };
  homeTasksDetails: string;
}
