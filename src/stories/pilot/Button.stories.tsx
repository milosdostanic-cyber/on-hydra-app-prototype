import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '../../ui/antd';

/** Every prop listed in `argTypes` with options becomes a Figma variant property in s2f. */
const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Button',
    type: 'default',
    size: 'middle',
    danger: false,
    ghost: false,
    disabled: false,
    loading: false,
    onClick: fn(),
  },
  argTypes: {
    children: { control: 'text', description: 'Label' },
    type: { control: 'select', options: ['primary', 'default', 'dashed', 'text', 'link'] },
    size: { control: 'inline-radio', options: ['small', 'middle', 'large'] },
    danger: { control: 'boolean' },
    ghost: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    onClick: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
