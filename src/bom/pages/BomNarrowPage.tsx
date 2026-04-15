import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BomCardTitle } from '../components/BomCardTitle';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomItemById, bomProjectTitleById, mockGuidedQuestions } from '../data/mockData';
import { Button, Card, Form, Radio, Space, Steps, theme } from '../../ui/antd';

export function BomNarrowPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '', itemId = '' } = useParams<{
    bomProjectId: string;
    itemId: string;
  }>();
  const navigate = useNavigate();
  const item = bomItemById(itemId);
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQ = mockGuidedQuestions[step];

  const stepItems = useMemo(
    () =>
      mockGuidedQuestions.map((q, i) => ({
        title: `Q${i + 1}`,
        description: q.question.slice(0, 48) + (q.question.length > 48 ? '…' : ''),
      })),
    [],
  );

  if (!item) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <BomPageHeader
          title="Line item not found"
          description="This line may have been removed from the parsed BOM."
          actions={
            <Button type="primary" size="large" onClick={() => navigate(`/bom/projects/${bomProjectId}/matching`)}>
              Back to matching
            </Button>
          }
        />
      </Space>
    );
  }

  const goRecommend = () => navigate(`/bom/projects/${bomProjectId}/items/${itemId}/recommend`);

  const onNext = () => {
    if (step < mockGuidedQuestions.length - 1) setStep((s) => s + 1);
    else goRecommend();
  };

  const skipQuestion = () => {
    if (step < mockGuidedQuestions.length - 1) setStep((s) => s + 1);
    else goRecommend();
  };

  const canNext = currentQ ? Boolean(answers[currentQ.id]) : false;

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomPageHeader
        title="Guided narrowing"
        description={`Project ${projectTitle}, line ${item.rowNumber}: ${item.parsedDescription}`}
        actions={
          <Space wrap>
            <Button size="large" onClick={() => navigate(`/bom/projects/${bomProjectId}/matching`)}>
              Cancel
            </Button>
            <Button type="primary" size="large" disabled={!canNext} onClick={onNext}>
              {step < mockGuidedQuestions.length - 1 ? 'Next' : 'View recommendation'}
            </Button>
          </Space>
        }
      />
      <Card
        title={<BomCardTitle>Questions for this line</BomCardTitle>}
        style={{ borderColor: token.colorBorderSecondary }}
      >
        <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
          <Steps current={step} items={stepItems} size="small" />
          {currentQ ? (
            <Form layout="vertical" style={{ maxWidth: token.screenLG }}>
              <Form.Item label={currentQ.question}>
                <Radio.Group
                  value={answers[currentQ.id]}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
                >
                  <Space orientation="vertical" size={token.marginXS}>
                    {currentQ.options.map((opt) => (
                      <Radio key={opt} value={opt}>
                        {opt}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Form>
          ) : null}
          <Space wrap>
            {step > 0 ? (
              <Button onClick={() => setStep((s) => Math.max(0, s - 1))}>Previous</Button>
            ) : null}
            <Button onClick={skipQuestion}>Skip question</Button>
          </Space>
        </Space>
      </Card>
    </Space>
  );
}
