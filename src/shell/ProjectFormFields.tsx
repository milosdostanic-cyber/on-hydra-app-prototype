import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import { Button, Col, Form, Input, Row, Select, Space, Typography, theme } from '../ui/antd';

import {
  CONTACT_ROLE_OPTIONS,
  COUNTRY_OPTIONS,
  PROJECT_NOTES_MAX_LENGTH,
  US_STATE_OPTIONS,
} from './projectFormOptions';
import type { ProjectContact, ProjectFormValues, ProjectRow } from './projectSeed';

type ProjectFormFieldsProps = {
  submitLabel: string;
  onCancel: () => void;
};

function sectionTitleStyle(token: ReturnType<typeof theme.useToken>['token']) {
  return {
    margin: 0,
    marginBottom: token.marginSM,
    color: token.colorPrimary,
    lineHeight: token.lineHeightHeading5,
  } as const;
}

export function projectRowToFormValues(row: ProjectRow): ProjectFormValues {
  return {
    name: row.name,
    address: row.address === 'TBD' ? undefined : row.address,
    address2: row.address2,
    country: row.country ?? 'US',
    city: row.city === 'TBD' ? undefined : row.city,
    state: row.state === '—' ? undefined : row.state,
    zipCode: row.zipCode,
    notes: row.notes,
    contacts: row.contacts?.length ? row.contacts : [{}],
  };
}

export function formValuesToProjectFields(
  values: ProjectFormValues,
): Pick<
  ProjectRow,
  'name' | 'address' | 'address2' | 'country' | 'city' | 'state' | 'zipCode' | 'notes' | 'contacts'
> {
  const contacts = (values.contacts ?? []).filter(
    (c) => c && (c.name?.trim() || c.email?.trim() || c.phone?.trim() || c.fax?.trim() || c.role),
  ) as ProjectContact[];

  return {
    name: values.name.trim(),
    address: values.address?.trim() || 'TBD',
    address2: values.address2?.trim() || undefined,
    country: values.country || 'US',
    city: values.city?.trim() || 'TBD',
    state: values.state?.trim() || '—',
    zipCode: values.zipCode?.trim() || undefined,
    notes: values.notes?.trim() || undefined,
    contacts: contacts.length > 0 ? contacts : undefined,
  };
}

export function ProjectFormFields({ submitLabel, onCancel }: ProjectFormFieldsProps) {
  const { token } = theme.useToken();

  return (
    <>
      <Typography.Title level={5} style={sectionTitleStyle(token)}>
        Information
      </Typography.Title>

      <Form.Item
        label="Project name"
        name="name"
        rules={[{ required: true, message: 'Enter a project name' }]}
      >
        <Input placeholder="Downtown Office Tower" />
      </Form.Item>

      <Row gutter={token.marginSM}>
        <Col xs={24} sm={12}>
          <Form.Item label="Address" name="address">
            <Input placeholder="123 Main Street" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Address 2" name="address2">
            <Input placeholder="Suite, floor, building…" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={token.marginSM}>
        <Col xs={24} sm={12}>
          <Form.Item label="Country" name="country" initialValue="US">
            <Select options={[...COUNTRY_OPTIONS]} showSearch optionFilterProp="label" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="City" name="city">
            <Input placeholder="Phoenix" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={token.marginSM}>
        <Col xs={24} sm={12}>
          <Form.Item label="State" name="state">
            <Select
              allowClear
              placeholder="Select state"
              options={[...US_STATE_OPTIONS]}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="ZIP Code" name="zipCode">
            <Input placeholder="85001" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Notes" name="notes">
        <Input.TextArea
          rows={4}
          maxLength={PROJECT_NOTES_MAX_LENGTH}
          showCount
          placeholder="Project notes"
        />
      </Form.Item>

      <Typography.Title level={5} style={{ ...sectionTitleStyle(token), marginTop: token.marginMD }}>
        Contacts
      </Typography.Title>

      <Form.List name="contacts" initialValue={[{}]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Row key={key} gutter={token.marginXS} align="top" wrap={false}>
                <Col flex="1 1 140px" style={{ minWidth: 0 }}>
                  <Form.Item {...restField} name={[name, 'name']} label={name === 0 ? 'Name' : undefined}>
                    <Input placeholder="Name" />
                  </Form.Item>
                </Col>
                <Col flex="1 1 120px" style={{ minWidth: 0 }}>
                  <Form.Item {...restField} name={[name, 'role']} label={name === 0 ? 'Role' : undefined}>
                    <Select allowClear placeholder="Role" options={[...CONTACT_ROLE_OPTIONS]} />
                  </Form.Item>
                </Col>
                <Col flex="1 1 160px" style={{ minWidth: 0 }}>
                  <Form.Item {...restField} name={[name, 'email']} label={name === 0 ? 'Email' : undefined}>
                    <Input placeholder="Email" type="email" />
                  </Form.Item>
                </Col>
                <Col flex="1 1 120px" style={{ minWidth: 0 }}>
                  <Form.Item {...restField} name={[name, 'phone']} label={name === 0 ? 'Phone' : undefined}>
                    <Input placeholder="Phone" />
                  </Form.Item>
                </Col>
                <Col flex="1 1 100px" style={{ minWidth: 0 }}>
                  <Form.Item {...restField} name={[name, 'fax']} label={name === 0 ? 'Fax' : undefined}>
                    <Input placeholder="Fax" />
                  </Form.Item>
                </Col>
                <Col flex="none" style={{ paddingTop: name === 0 ? token.controlHeight : token.marginXXS }}>
                  {fields.length > 1 ? (
                    <Button
                      type="text"
                      icon={<MinusCircleOutlined />}
                      aria-label="Remove contact"
                      onClick={() => remove(name)}
                    />
                  ) : null}
                </Col>
              </Row>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add({})} block icon={<PlusOutlined />}>
                Add contact
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item style={{ marginBottom: 0, marginTop: token.marginMD }}>
        <Space>
          <Button type="primary" htmlType="submit">
            {submitLabel}
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </Form.Item>
    </>
  );
}
