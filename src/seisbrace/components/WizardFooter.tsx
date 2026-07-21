import { Button, Divider, Flex, theme } from '../../ui/antd';

type Props = {
  onBack?: () => void;
  onSave?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
};

/** Shared wizard step footer (Back / Save link / primary Next|Finish). */
export function WizardFooter({ onBack, onSave, onNext, nextLabel = 'Next step', nextDisabled }: Props) {
  const { token } = theme.useToken();
  return (
    <div style={{ marginTop: token.marginLG }}>
      <Divider style={{ marginBlock: token.marginMD }} />
      <Flex align="center" justify="space-between" gap={token.marginSM} wrap="wrap">
        <div>{onBack ? <Button onClick={onBack}>Back</Button> : null}</div>
        <Flex align="center" gap={token.marginSM}>
          {onSave ? (
            <Button type="link" onClick={onSave}>
              Save &amp; exit
            </Button>
          ) : null}
          {onNext ? (
            <Button type="primary" onClick={onNext} disabled={nextDisabled}>
              {nextLabel}
            </Button>
          ) : null}
        </Flex>
      </Flex>
    </div>
  );
}
