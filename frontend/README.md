# Student Academic Growth Velocity Analyzer (SAGVA) - Frontend

A modern, responsive React application for analyzing student academic performance trends and calculating growth velocity. Built with React Router, Recharts, and Context API.

## Features

### 🎯 Core Functionality

- **Authentication System**: Login, register with role-based access (Student, Teacher, Admin)
- **Student Dashboard**: View GPA trends, performance status, and academic progress
- **Growth Analytics**: Track GPA progression and growth velocity scores
- **Academic Records**: Add and manage semester records with subjects and marks
- **Teacher Dashboard**: Monitor student performance, identify at-risk students, view department statistics
- **Admin Panel**: System-wide analytics, department performance metrics, institutional insights

### 🎨 UI Features

- Clean, modern dashboard design
- Professional academic theme with blue, green, and dark navy color scheme
- Fully responsive layout (mobile, tablet, desktop)
- Interactive charts and visualizations
- Real-time data validation
- Smooth animations and transitions
- Loading states and empty states

## Tech Stack

- **React 19** - UI framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Context API** - State management for authentication
- **CSS3** - Styling with modern features

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   Opens [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── components/           # Reusable components
│   ├── Alert.js
│   ├── Badge.js
│   ├── Button.js
│   ├── ChartContainer.js
│   ├── EmptyState.js
│   ├── InputField.js
│   ├── Loading.js
│   ├── ProtectedRoute.js
│   ├── RoleBasedRoute.js
│   └── StatCard.js
├── context/             # Context API
│   └── AuthContext.js   # Authentication state management
├── layouts/             # Layout components
│   ├── DashboardLayout.js
│   ├── Navbar.js
│   └── Sidebar.js
├── pages/               # Page components
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   ├── StudentDashboard.js
│   ├── AddRecordPage.js
│   ├── AnalyticsPage.js
│   ├── TeacherDashboard.js
│   └── AdminPanel.js
├── services/            # API services
│   └── api.js          # API calls and dummy data
├── styles/              # CSS files
│   ├── globals.css
│   ├── AdminPanel.css
│   ├── AnalyticsPage.css
│   ├── AddRecordPage.css
│   ├── Alert.css
│   ├── AuthPages.css
│   ├── Badge.css
│   ├── Button.css
│   ├── ChartContainer.css
│   ├── DashboardLayout.css
│   ├── InputField.css
│   ├── Loading.css
│   ├── Navbar.css
│   ├── Sidebar.css
│   ├── StatCard.css
│   ├── StudentDashboard.css
│   └── TeacherDashboard.css
├── App.js               # Main app component with routing
├── App.css
├── index.js
└── index.css
```

## Usage

### Demo Credentials

For testing, use:
- **Email**: demo@example.com
- **Password**: password123

### User Roles

1. **Student**
   - View personal dashboard with GPA and growth metrics
   - Add academic records for new semesters
   - Access growth analytics and trends
   - Navigate via sidebar to different sections

2. **Teacher**
   - Monitor all students' performance
   - Filter students by department
   - Sort by lowest velocity or GPA
   - Identify at-risk students (highlighted in red)
   - View department-wise statistics

3. **Admin**
   - System-wide analytics and metrics
   - Department performance overview
   - Student statistics
   - Institutional insights and recommendations
   - **Manage Students:** add, edit or delete student accounts from a dedicated page

## API Integration

The application currently uses dummy data. To connect with a backend API:

1. Update `src/services/api.js` with your API endpoints
2. Set `REACT_APP_API_URL` in `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Expected API Endpoints

```
GET /students              - Get all students
GET /students/:id          - Get single student
POST /students             - Create a student (admin)
PUT /students/:id          - Update a student (admin)
DELETE /students/:id       - Delete a student (admin)
GET /students/:id/records  - Get student academic records
POST /records              - Add new record
GET /analytics/:id         - Get student analytics
GET /admin/stats           - Get admin statistics
```

## Color Scheme

- **Primary**: #2563EB (Blue)
- **Secondary**: #0F172A (Dark Navy)
- **Accent**: #22C55E (Green)
- **Danger**: #EF4444 (Red)
- **Warning**: #EAB308 (Yellow)
- **Light**: #F8FAFC (Light Gray)
- **Border**: #E2E8F0 (Border Gray)

## Responsive Design

- **Desktop**: Full layout with sidebar and navbar
- **Tablet**: Collapsible sidebar, responsive grids
- **Mobile**: Full-screen layout, touch-friendly buttons

## Key Components

### StatCard
Displays key metrics with icon, title, value, and trend indicator.

### ChartContainer
Wrapper for chart visualizations with consistent styling.

### InputField
Reusable form input with validation, error messages, and helper text.

### ProtectedRoute
Wraps routes that require authentication.

### RoleBasedRoute
Ensures users can only access their role-specific pages.

## Available Scripts

### `npm start`
Runs the development server on port 3000.

### `npm build`
Creates an optimized production build.

### `npm test`
Runs the test suite.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Lazy loading of components
- Memoization of expensive computations
- Optimized chart rendering with Recharts
- Efficient CSS with CSS Grid and Flexbox

## Error Handling

- Form validation with user-friendly error messages
- API error handling with try-catch blocks
- Empty states for no data scenarios
- Loading indicators during data fetch

## Future Enhancements

- Real backend API integration
- Student notifications
- Progress email reports
- Advanced filtering and search
- Export to PDF functionality
- Dark mode support
- Internationalization (i18n)
- User profile management
- Student-teacher messaging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, feature requests, or questions, please contact the development team.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
