import { usePartActionFlows } from '../usePartActionFlows';
import type { PartActionPayload } from '../usePartActionFlows';
import { Button, Flex, theme } from '../../ui/antd';

type Props = {
  payload: PartActionPayload;
};

/** Four prominent figure-number CTAs at the bottom of the part detail stack. */
export function FigureNumberActions({ payload }: Props) {
  const { token } = theme.useToken();
  const { requestAction, modals, actionLabels } = usePartActionFlows(payload);

  return (
    <>
      <Flex wrap="wrap" gap={token.marginSM}>
        {actionLabels.map(({ id, label }) => (
          <Button
            key={id}
            type="primary"
            size="large"
            style={{ fontWeight: token.fontWeightStrong }}
            onClick={() => requestAction(id)}
          >
            {label}
          </Button>
        ))}
      </Flex>
      {modals}
    </>
  );
}
