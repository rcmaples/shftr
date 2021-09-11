// @material-ui/icons
import LoginIcon from '@material-ui/icons/LockOpen';
import DateRangeIcon from '@material-ui/icons/DateRange';
import SettingsIcon from '@material-ui/icons/Settings';
import TuneIcon from '@material-ui/icons/Tune';
import ListAltIcon from '@material-ui/icons/ListAlt';
import PeopleIcon from '@material-ui/icons/People';

// core components/views for Admin layout
import AgentsPage from './views/Agents/AgentsPage';
import DashboardPage from './views/Dashboard/Dashboard';
import RulesPage from './views/Rules/RulesPage';
import HistoryPage from './views/History/HistoryPage';
import QueuesPage from './views/Queues/QueuesPage';
import SchedulerContainer from './views/Scheduler/Scheduler';
import Settings from './views/Settings/Settings';
import Reports from './views/Reports/Reports';
import TagsPage from './views/Tags/TagsPage';
import UserProfile from './views/UserProfile/UserProfile';

// code components/views for Auth layout
import LoginPage from './views/Pages/LoginPage';

const dashboardRoutes = [
  // {
  //   path: '/dashboard',
  //   name: 'Dashboard',
  //   icon: DashboardIcon,
  //   component: DashboardPage,
  //   layout: '/admin',
  // },
  {
    path: '/scheduler',
    name: 'Scheduler',
    icon: DateRangeIcon,
    component: SchedulerContainer,
    layout: '/admin',
  },
  // {
  //   path: '/queues',
  //   name: 'Queues',
  //   icon: CallSplitRoundedIcon,
  //   component: QueuesPage,
  //   layout: '/admin',
  // },
  {
    path: '/rules',
    name: 'Rules',
    icon: TuneIcon,
    component: RulesPage,
    layout: '/admin',
  },
  {
    path: '/agents',
    name: 'Agents',
    icon: PeopleIcon,
    component: AgentsPage,
    layout: '/admin',
  },
  {
    path: '/history',
    name: 'History',
    icon: ListAltIcon,
    component: HistoryPage,
    layout: '/admin',
  },
  // {
  //   path: '/tags',
  //   name: 'Tags',
  //   icon: LocalOfferIcon,
  //   component: TagsPage,
  //   layout: '/admin',
  // },
  // {
  //   path: '/reports',
  //   name: 'Reports',
  //   icon: ListAltIcon,
  //   component: Reports,
  //   layout: '/admin',
  // },
  // {
  //   path: '/user',
  //   name: 'User Profile',
  //   icon: PersonIcon,
  //   component: UserProfile,
  //   layout: '/admin',
  // },
  {
    path: '/settings',
    name: 'Settings',
    icon: SettingsIcon,
    component: Settings,
    layout: '/admin',
  },
  {
    path: '/login-page',
    name: 'Login',
    icon: LoginIcon,
    component: LoginPage,
    layout: '/auth',
  },
];

export default dashboardRoutes;
