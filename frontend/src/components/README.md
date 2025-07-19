# FamilyTreeBuilder Component

A comprehensive, modern UI component for creating and customizing family trees with an intuitive interface. Built on top of the ClanCrest family chart library.

## Features

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Intuitive Interface**: Clean, modern design with clear visual hierarchy
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Visual Feedback**: Loading states, status messages, and smooth animations

### 🛠️ Rich Functionality
- **Form-Based Editing**: Add persons with detailed information (name, gender, birth date, avatar, notes)
- **Real-Time Preview**: See changes immediately in the family tree visualization
- **Statistics Dashboard**: View tree statistics (total persons, gender distribution, relationships)
- **Quick Actions**: Add root person, parents, spouse, or children with one click
- **Auto-Save**: Optional automatic saving to prevent data loss

### 🔗 Backend Integration
- **API Integration**: Seamless connection to ClanCrest backend API
- **Data Persistence**: Save and load family trees from database
- **Export/Import**: Export trees as JSON files for backup or sharing
- **Error Handling**: Comprehensive error handling with user-friendly messages

### 📱 Mobile-First Design
- **Touch-Friendly**: Large touch targets and gesture support
- **Responsive Layout**: Adapts to different screen sizes
- **Progressive Enhancement**: Core functionality works without JavaScript

## Usage

### Basic Implementation

```javascript
import FamilyTreeBuilder from './components/FamilyTreeBuilder.js'

// Create the builder
const builder = new FamilyTreeBuilder(container, {
  api_base_url: 'http://localhost:3001/api',
  auto_save: true
})
```

### Advanced Configuration

```javascript
const builder = new FamilyTreeBuilder(container, {
  // Chart configuration
  node_separation: 250,
  level_separation: 150,
  card_dimensions: {w: 220, h: 70, text_x: 75, text_y: 15, img_w: 60, img_h: 60, img_x: 5, img_y: 5},
  
  // UI configuration
  show_toolbar: true,
  show_sidebar: true,
  show_preview: true,
  show_statistics: true,
  
  // API configuration
  api_base_url: 'http://localhost:3001/api',
  auto_save: false,
  auto_save_interval: 30000,
  
  // Custom form fields
  default_fields: [
    {id: 'first_name', type: 'text', label: 'First Name', required: true},
    {id: 'last_name', type: 'text', label: 'Last Name', required: true},
    {id: 'birth_date', type: 'date', label: 'Birth Date'},
    {id: 'gender', type: 'select', label: 'Gender', options: [
      {value: 'M', label: 'Male'},
      {value: 'F', label: 'Female'}
    ]},
    {id: 'avatar', type: 'url', label: 'Avatar URL'},
    {id: 'notes', type: 'textarea', label: 'Notes'}
  ],
  
  // Event callbacks
  onPersonAdded: (person) => console.log('Person added:', person),
  onPersonUpdated: (person) => console.log('Person updated:', person),
  onPersonDeleted: (person) => console.log('Person deleted:', person),
  onTreeSaved: (result) => console.log('Tree saved:', result),
  onTreeLoaded: (data) => console.log('Tree loaded:', data),
  onError: (error) => console.error('Builder error:', error)
})
```

## API Reference

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `node_separation` | number | 250 | Horizontal separation between nodes |
| `level_separation` | number | 150 | Vertical separation between levels |
| `card_dimensions` | object | See code | Dimensions for person cards |
| `show_toolbar` | boolean | true | Show the main toolbar |
| `show_sidebar` | boolean | true | Show the sidebar with forms |
| `show_preview` | boolean | true | Show tree preview panel |
| `show_statistics` | boolean | true | Show statistics dashboard |
| `api_base_url` | string | 'http://localhost:3001/api' | Backend API URL |
| `auto_save` | boolean | false | Enable automatic saving |
| `auto_save_interval` | number | 30000 | Auto-save interval in milliseconds |
| `default_fields` | array | See code | Custom form fields configuration |
| `onPersonAdded` | function | null | Callback when person is added |
| `onPersonUpdated` | function | null | Callback when person is updated |
| `onPersonDeleted` | function | null | Callback when person is deleted |
| `onTreeSaved` | function | null | Callback when tree is saved |
| `onTreeLoaded` | function | null | Callback when tree is loaded |
| `onError` | function | null | Callback when error occurs |

### Methods

#### `getData()`
Returns the current tree data.

```javascript
const data = builder.getData()
console.log('Current tree data:', data)
```

#### `setData(data)`
Sets the tree data and updates the visualization.

```javascript
const newData = [
  {
    id: '1',
    data: {
      'first name': 'John',
      'last name': 'Doe',
      'gender': 'M'
    },
    rels: {
      father: null,
      mother: null,
      spouses: [],
      children: []
    }
  }
]
builder.setData(newData)
```

#### `destroy()`
Clean up the component and remove event listeners.

```javascript
builder.destroy()
```

## Data Format

The component expects data in the following format:

```javascript
[
  {
    id: 'unique-id',
    data: {
      'first name': 'John',
      'last name': 'Doe',
      'birthday': '1990-01-01',
      'gender': 'M', // 'M' for male, 'F' for female
      'avatar': 'https://example.com/avatar.jpg',
      'notes': 'Additional information'
    },
    rels: {
      father: 'father-id', // ID of father (optional)
      mother: 'mother-id', // ID of mother (optional)
      spouses: ['spouse-id-1', 'spouse-id-2'], // Array of spouse IDs
      children: ['child-id-1', 'child-id-2'] // Array of child IDs
    }
  }
]
```

## Styling

The component includes comprehensive CSS styling that follows modern design principles:

- **Responsive Design**: Uses CSS Grid and Flexbox for flexible layouts
- **Mobile-First**: Optimized for mobile devices with touch-friendly interfaces
- **Accessibility**: High contrast ratios and semantic HTML structure
- **Performance**: Optimized animations and efficient CSS selectors

### Custom Styling

You can customize the appearance by overriding CSS variables:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --error-color: #dc3545;
  --text-color: #333;
  --background-color: #f8f9fa;
}
```

## Browser Support

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

## Dependencies

- **D3.js**: For tree visualization
- **ClanCrest Library**: Core family tree functionality
- **Modern JavaScript**: ES6+ features

## Development

### Building

The component is built using modern JavaScript modules and can be imported directly:

```javascript
import FamilyTreeBuilder from './components/FamilyTreeBuilder.js'
```

### Testing

Run the demo to test the component:

```bash
# Start the development server
npm run dev

# Open the demo page
open http://localhost:5173/examples/family-tree-builder-demo/
```

## Contributing

1. Follow the coding principles outlined in `.cursor/rules/`
2. Ensure all new features are responsive and accessible
3. Add comprehensive error handling
4. Include proper documentation for new features
5. Test across different devices and browsers

## License

This component is part of the ClanCrest project and follows the same licensing terms. 