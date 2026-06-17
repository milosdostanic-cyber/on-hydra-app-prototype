import { useNavigate } from 'react-router-dom';

import { workspaceAscProductsPath, workspaceFigureLinkState } from '../bomWorkspaceDashboard';
import { Typography } from '../../ui/antd';

type BomAscFigureLinkProps = {
  bomProjectId: string;
  figureNumber: string;
  /** e.g. "Fig. " or "Figure " */
  prefix?: string;
};

/** Opens the ASC part listing (ConnectED BOM catalog browser) for a figure number. */
export function BomAscFigureLink({ bomProjectId, figureNumber, prefix = '' }: BomAscFigureLinkProps) {
  const navigate = useNavigate();
  const figure = figureNumber.trim();
  if (!figure || !bomProjectId) return null;

  return (
    <Typography.Link
      underline
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(workspaceAscProductsPath(bomProjectId), {
          state: workspaceFigureLinkState(figure),
        });
      }}
    >
      {prefix}
      {figure}
    </Typography.Link>
  );
}
