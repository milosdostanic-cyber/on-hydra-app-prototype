import { SITE_CLASS_OPTIONS } from '../constants/options';
import { Col, InputNumber, Row, Select, Typography, theme } from '../../ui/antd';
import type { CpMethod } from '../types';

type CpInputs = Record<string, number | string>;

type Props = {
  method: CpMethod;
  inputs: CpInputs;
  onChange: (next: CpInputs) => void;
};

const HEIGHT_OPTIONS = ['0–10 ft', '10–20 ft', '20–30 ft', '30 ft+'].map((v) => ({ value: v, label: v }));
const RISK_CATEGORY_OPTIONS = ['I', 'II', 'III', 'IV'].map((v) => ({ value: v, label: `Risk Category ${v}` }));

/**
 * Method-specific Cp inputs (ZIP `CpCalculationInput` switch over methods A–H). Field set varies by
 * method; the parent recomputes the representative Cp via `computeCp`.
 */
export function CpCalculationInput({ method, inputs, onChange }: Props) {
  const { token } = theme.useToken();
  const set = (key: string, value: number | string | null) =>
    onChange({ ...inputs, [key]: value ?? '' });

  const numberField = (key: string, label: string, props?: { min?: number; max?: number; step?: number }) => (
    <Col xs={24} sm={12}>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: token.marginXXS }}>
        {label}
      </Typography.Text>
      <InputNumber
        value={inputs[key] as number}
        onChange={(v) => set(key, v)}
        style={{ width: '100%' }}
        min={props?.min ?? 0}
        max={props?.max}
        step={props?.step ?? 0.1}
      />
    </Col>
  );

  const selectField = (
    key: string,
    label: string,
    options: { value: string; label: string }[],
  ) => (
    <Col xs={24} sm={12}>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: token.marginXXS }}>
        {label}
      </Typography.Text>
      <Select
        value={(inputs[key] as string) || undefined}
        onChange={(v) => set(key, v)}
        options={options}
        style={{ width: '100%' }}
        placeholder="Select"
      />
    </Col>
  );

  return (
    <Row gutter={[token.marginMD, token.marginSM]}>
      {(method === 'A' || method === 'B') && numberField('ss', 'Ss (mapped spectral acceleration)', { max: 4 })}
      {method === 'C' && numberField('cp', 'Cp (manual)', { min: 0.001, max: 999, step: 0.01 })}
      {(method === 'D' || method === 'E' || method === 'F') &&
        numberField('ss', 'Ss (mapped spectral acceleration)', { max: 4 })}
      {(method === 'G' || method === 'H') && numberField('sDs', 'SDs (design spectral acceleration)', { max: 4 })}

      {(method === 'D' || method === 'E' || method === 'F') && selectField('site', 'Site class', SITE_CLASS_OPTIONS)}
      {(method === 'F' || method === 'G') && selectField('heightOfBrace', 'Height of brace', HEIGHT_OPTIONS)}
      {method === 'H' && selectField('buildingRiskCategory', 'Building risk category', RISK_CATEGORY_OPTIONS)}

      {(method === 'D' || method === 'H') && numberField('z', 'z (attachment height, ft)', { step: 1 })}
      {(method === 'D' || method === 'H') && numberField('h', 'h (building height, ft)', { step: 1 })}
    </Row>
  );
}
