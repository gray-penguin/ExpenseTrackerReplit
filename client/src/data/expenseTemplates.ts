// Expense templates for generating realistic mock data
export interface ExpenseTemplate {
  categoryId: string;
  subcategoryId: string;
  descriptions: string[];
  amounts: number[];
  stores: string[];
  locations: string[];
}

export const expenseTemplates: ExpenseTemplate[] = [
  // Utilities expenses (monthly recurring)
  { 
    categoryId: '1', 
    subcategoryId: '1', 
    descriptions: ['Monthly electricity bill', 'Electricity usage'], 
    amounts: [120, 145, 98, 165], 
    stores: ['Pacific Power', 'City Electric'], 
    locations: ['Online', 'Online'] 
  },
  { 
    categoryId: '1', 
    subcategoryId: '2', 
    descriptions: ['Water and sewer bill', 'Monthly water service'], 
    amounts: [65, 78, 55, 82], 
    stores: ['City Water Department', 'Municipal Water'], 
    locations: ['Online', 'Online'] 
  },
  { 
    categoryId: '1', 
    subcategoryId: '3', 
    descriptions: ['Natural gas bill', 'Heating and gas'], 
    amounts: [85, 125, 45, 95], 
    stores: ['Northwest Natural', 'Gas Company'], 
    locations: ['Online', 'Online'] 
  },
  { 
    categoryId: '1', 
    subcategoryId: '4', 
    descriptions: ['Internet and cable', 'High-speed internet', 'Cable TV service'], 
    amounts: [89.99, 95, 110], 
    stores: ['Comcast', 'Verizon', 'AT&T'], 
    locations: ['Online', 'Online', 'Online'] 
  },
  { 
    categoryId: '1', 
    subcategoryId: '5', 
    descriptions: ['Cell phone bill', 'Mobile service', 'Phone plan'], 
    amounts: [125, 140, 95], 
    stores: ['Verizon', 'T-Mobile', 'AT&T'], 
    locations: ['Online', 'Online', 'Online'] 
  },
  
  // Groceries expenses (weekly)
  { 
    categoryId: '2', 
    subcategoryId: '6', 
    descriptions: ['Weekly grocery shopping', 'Family groceries', 'Food shopping'], 
    amounts: [145, 165, 125, 185], 
    stores: ['Safeway', 'Fred Meyer', 'Whole Foods', 'Costco'], 
    locations: ['Neighborhood', 'Local', 'Downtown', 'Warehouse'] 
  },
  { 
    categoryId: '2', 
    subcategoryId: '7', 
    descriptions: ['Fresh fruits and vegetables', 'Organic produce', 'Farmers market'], 
    amounts: [35, 45, 28, 52], 
    stores: ['Farmers Market', 'Whole Foods', 'Local Market'], 
    locations: ['Downtown', 'Neighborhood', 'Local'] 
  },
  { 
    categoryId: '2', 
    subcategoryId: '8', 
    descriptions: ['Meat and dairy products', 'Protein and dairy', 'Fresh meat'], 
    amounts: [45, 65, 38, 72], 
    stores: ['Butcher Shop', 'Safeway', 'Costco'], 
    locations: ['Local', 'Neighborhood', 'Warehouse'] 
  },
  { 
    categoryId: '2', 
    subcategoryId: '9', 
    descriptions: ['Cleaning supplies', 'Household essentials', 'Paper products'], 
    amounts: [25, 35, 18, 42], 
    stores: ['Target', 'Costco', 'Dollar Store'], 
    locations: ['Local', 'Warehouse', 'Neighborhood'] 
  },
  { 
    categoryId: '2', 
    subcategoryId: '10', 
    descriptions: ['Kids snacks', 'Family treats', 'Beverages'], 
    amounts: [15, 25, 12, 35], 
    stores: ['Target', 'Safeway', 'Corner Store'], 
    locations: ['Local', 'Neighborhood', 'Local'] 
  },
  
  // Transportation expenses
  { 
    categoryId: '3', 
    subcategoryId: '11', 
    descriptions: ['Gas fill-up', 'Fuel for car', 'Gasoline'], 
    amounts: [45, 55, 38, 62], 
    stores: ['Shell', 'Chevron', 'Arco', '76 Station'], 
    locations: ['Main Street', 'Highway', 'Neighborhood', 'Downtown'] 
  },
  { 
    categoryId: '3', 
    subcategoryId: '12', 
    descriptions: ['Oil change', 'Car maintenance', 'Tire rotation', 'Brake service'], 
    amounts: [45, 285, 65, 450], 
    stores: ['Jiffy Lube', 'Toyota Service', 'Discount Tire'], 
    locations: ['Local', 'Dealership', 'Auto Center'] 
  },
  { 
    categoryId: '3', 
    subcategoryId: '13', 
    descriptions: ['Auto insurance premium', 'Car insurance'], 
    amounts: [165, 175], 
    stores: ['State Farm', 'Allstate'], 
    locations: ['Online', 'Online'] 
  },
  { 
    categoryId: '3', 
    subcategoryId: '14', 
    descriptions: ['Bus fare', 'Light rail ticket', 'Public transit'], 
    amounts: [3.25, 5.50, 2.75], 
    stores: ['Metro Transit', 'Sound Transit'], 
    locations: ['Transit Station', 'Train Station'] 
  },
  { 
    categoryId: '3', 
    subcategoryId: '15', 
    descriptions: ['Parking fee', 'Downtown parking', 'Airport parking'], 
    amounts: [8, 12, 25, 45], 
    stores: ['ParkWhiz', 'City Parking', 'Airport'], 
    locations: ['Downtown', 'City Center', 'Airport'] 
  },
  
  // Vacation expenses (seasonal)
  { 
    categoryId: '4', 
    subcategoryId: '16', 
    descriptions: ['Flight tickets', 'Airline tickets', 'Air travel'], 
    amounts: [450, 650, 325, 850], 
    stores: ['Alaska Airlines', 'Southwest', 'Delta'], 
    locations: ['Airport', 'Online', 'Online'] 
  },
  { 
    categoryId: '4', 
    subcategoryId: '17', 
    descriptions: ['Hotel stay', 'Vacation rental', 'Resort booking'], 
    amounts: [185, 225, 145, 295], 
    stores: ['Marriott', 'Airbnb', 'Holiday Inn'], 
    locations: ['Destination', 'Vacation Spot', 'Resort'] 
  },
  { 
    categoryId: '4', 
    subcategoryId: '18', 
    descriptions: ['Restaurant dinner', 'Family dining', 'Vacation meals'], 
    amounts: [65, 85, 45, 125], 
    stores: ['Local Restaurant', 'Seaside Cafe', 'Family Diner'], 
    locations: ['Vacation', 'Resort', 'Downtown'] 
  },
  { 
    categoryId: '4', 
    subcategoryId: '19', 
    descriptions: ['Theme park tickets', 'Museum admission', 'Tour booking'], 
    amounts: [125, 85, 45, 195], 
    stores: ['Disneyland', 'Local Museum', 'Tour Company'], 
    locations: ['Theme Park', 'City', 'Tourist Area'] 
  },
  { 
    categoryId: '4', 
    subcategoryId: '20', 
    descriptions: ['Vacation souvenirs', 'Travel gifts', 'Postcards'], 
    amounts: [25, 45, 15, 65], 
    stores: ['Gift Shop', 'Souvenir Store', 'Local Market'], 
    locations: ['Tourist Area', 'Vacation', 'Local'] 
  },
  
  // Home Improvements expenses
  { 
    categoryId: '5', 
    subcategoryId: '21', 
    descriptions: ['Drill and bits', 'Hammer set', 'Screwdriver kit', 'Power tools'], 
    amounts: [85, 45, 25, 195], 
    stores: ['Home Depot', 'Lowes', 'Harbor Freight'], 
    locations: ['Hardware Store', 'Home Center', 'Tool Store'] 
  },
  { 
    categoryId: '5', 
    subcategoryId: '22', 
    descriptions: ['Interior paint', 'Exterior paint', 'Paint brushes', 'Primer'], 
    amounts: [45, 65, 15, 35], 
    stores: ['Sherwin Williams', 'Home Depot', 'Benjamin Moore'], 
    locations: ['Paint Store', 'Hardware Store', 'Home Center'] 
  },
  { 
    categoryId: '5', 
    subcategoryId: '23', 
    descriptions: ['New refrigerator', 'Washing machine', 'Dishwasher repair'], 
    amounts: [1250, 850, 185], 
    stores: ['Best Buy', 'Sears', 'Appliance Repair'], 
    locations: ['Electronics Store', 'Appliance Store', 'Home Service'] 
  },
  { 
    categoryId: '5', 
    subcategoryId: '24', 
    descriptions: ['Living room sofa', 'Dining table', 'Bedroom dresser'], 
    amounts: [895, 650, 425], 
    stores: ['IKEA', 'Ashley Furniture', 'Local Furniture'], 
    locations: ['Furniture Store', 'Showroom', 'Local Store'] 
  },
  { 
    categoryId: '5', 
    subcategoryId: '25', 
    descriptions: ['Plumber service', 'Electrician work', 'Handyman repair'], 
    amounts: [185, 295, 125], 
    stores: ['Local Plumber', 'ABC Electric', 'Handyman Services'], 
    locations: ['Home Service', 'Professional', 'Local Service'] 
  }
];