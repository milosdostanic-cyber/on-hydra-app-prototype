/**
 * Curated re-exports from `antd` for Hydra. Tree-shaking still applies to what you import.
 * Add or remove symbols here as the app grows; full API remains available via `import { X } from 'antd'`.
 *
 * **Typography:** Global font tokens come from `ConfigProvider` in `main.tsx` (`hydraAntdTheme` →
 * [`hydraAntdTypographyToken`](../theme/hydraAntdTypography.ts)). Prefer `theme.useToken()` for sizes
 * (`fontSize`, `fontSizeSM`, `fontSizeHeading*`, …) or import a named style from
 * [`hydraTypography`](../theme/hydraTypography.ts) when you need a specific text style (e.g. `hydraSmallStrong`).
 */
export {
  Alert,
  App,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  ConfigProvider,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Flex,
  FloatButton,
  Form,
  Grid,
  Input,
  InputNumber,
  Layout,
  List,
  Menu,
  message,
  Modal,
  notification,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  Radio,
  Rate,
  Result,
  Row,
  Select,
  Skeleton,
  Space,
  Spin,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  TimePicker,
  Tooltip,
  Tree,
  Typography,
  Upload,
  theme,
} from 'antd';

export type {
  BreadcrumbProps,
  FormProps,
  FormInstance,
  MenuProps,
  TableColumnsType,
  TableProps,
  SelectProps,
  TabsProps,
} from 'antd';

export { AppSearchInput, INLINE_SEARCH_CONTROL_SIZE } from './AppSearchInput';
export type { AppSearchInputProps } from './AppSearchInput';
