import { Icon, mergeStyles, Panel, PanelType, PrimaryButton } from '@fluentui/react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiEndpoint } from '../../../models/apiEndpoints';
import { Operation } from '../../../models/operation';
import { ResourceType } from '../../../models/resourceType';
import { Workspace } from '../../../models/workspace';
import { WorkspaceService } from '../../../models/workspaceService';
import { OperationsContext } from '../../../contexts/OperationsContext';
import { ResourceForm } from './ResourceForm';
import { SelectTemplate } from './SelectTemplate';
import { getResourceFromResult, Resource } from '../../../models/resource';
import { HttpMethod, useAuthApiCall } from '../../../hooks/useAuthApiCall';

interface CreateUpdateResourceMemoProps {
  isOpen: boolean,
  onClose: () => void,
  workspaceApplicationIdURI?: string,
  resourceType: ResourceType,
  parentResource?: Workspace | WorkspaceService,
  onAddResource?: (r: Resource) => void,
  updateResource?: Resource
}

interface CreateUpdateResourceProps extends CreateUpdateResourceMemoProps {
  updateOperation: (op: Operation) => void
}

interface PageTitle {
  selectTemplate: string,
  resourceForm: string,
  creating: string
}

const creatingIconClass = mergeStyles({
  fontSize: 100,
  height: 100,
  width: 100,
  margin: '0 25px',
  color: 'deepskyblue',
  padding: 20
});

const CreateUpdateResource: React.FunctionComponent<CreateUpdateResourceProps> = (props: CreateUpdateResourceProps) => {
  const [page, setPage] = useState('selectTemplate' as keyof PageTitle);
  const [selectedTemplate, setTemplate] = useState(props.updateResource?.templateName || '');
  const [deployOperation, setDeployOperation] = useState({} as Operation);

  // const [currentPage, setCurrentPage] = useState(<></> as JSX.Element);
  const navigate = useNavigate();
  const apiCall = useAuthApiCall();

  useEffect(() => {
   // console.warn("CreateUpdateResource render");
  })

  useEffect(() => {
    const clearState = () => {
      setPage('selectTemplate');
      setDeployOperation({} as Operation);
      setTemplate('');
    }

    !props.isOpen && clearState();
    props.isOpen && props.updateResource && props.updateResource.templateName && selectTemplate(props.updateResource.templateName);
  }, [props.isOpen, props.updateResource]);

  // Render a panel title depending on sub-page
  const pageTitles: PageTitle = {
    selectTemplate: 'Choose a template',
    resourceForm: 'Create / Update a ' + props.resourceType,
    creating: ''
  }

  // Construct API path for templates of specified resourceType
  let templatesPath: string;
  switch (props.resourceType) {
    case ResourceType.Workspace:
      templatesPath = ApiEndpoint.WorkspaceTemplates; break;
    case ResourceType.WorkspaceService:
      templatesPath = ApiEndpoint.WorkspaceServiceTemplates; break;
    case ResourceType.SharedService:
      templatesPath = ApiEndpoint.SharedServiceTemplates; break;
    case ResourceType.UserResource:
      if (props.parentResource) {
        templatesPath = `${ApiEndpoint.WorkspaceServiceTemplates}/${props.parentResource.templateName}/${ApiEndpoint.UserResourceTemplates}`; break;
      } else {
        throw Error('Parent workspace service must be passed as prop when creating user resource.');
      }
    default:
      throw Error('Unsupported resource type.');
  }

  // Construct API path for resource creation
  let resourcePath: string;
  switch (props.resourceType) {
    case ResourceType.Workspace:
      resourcePath = ApiEndpoint.Workspaces; break;
    case ResourceType.SharedService:
      resourcePath = ApiEndpoint.SharedServices; break;
    default:
      if (!props.parentResource) {
        throw Error('A parentResource must be passed as prop if creating a workspace-service or user-resource');
      }
      resourcePath = `${props.parentResource.resourcePath}/${props.resourceType}s`;
  }

  const selectTemplate = (templateName: string) => {
    setTemplate(templateName);
    setPage('resourceForm');
  }

  const resourceCreating = async (operation: Operation) => {
    setDeployOperation(operation);
    setPage('creating');

    // Add deployment operation to notifications operation poller
    props.updateOperation(operation);

    // if an onAdd callback has been given, get the resource we just created and pass it back
    if (props.onAddResource) {
      let resource = getResourceFromResult(await apiCall(operation.resourcePath, HttpMethod.Get, props.workspaceApplicationIdURI));
      props.onAddResource(resource);
    }
  }

  //return (
  return useMemo(() => {
    return (<>
      <Panel
        headerText={pageTitles[page]}
        isOpen={props.isOpen}
        onDismiss={props.onClose}
        type={PanelType.medium}
        closeButtonAriaLabel="Close"
        isLightDismiss
      >
        <div style={{ paddingTop: 30 }}>
          {
            page === 'selectTemplate' &&
            <SelectTemplate templatesPath={templatesPath} onSelectTemplate={selectTemplate} />
          }
          {
            page === 'resourceForm' &&
            <ResourceForm
              templateName={selectedTemplate}
              templatePath={`${templatesPath}/${selectedTemplate}`}
              resourcePath={resourcePath}
              onCreateResource={(op: Operation) => resourceCreating(op)}
              workspaceApplicationIdURI={props.workspaceApplicationIdURI}
              updateResource={props.updateResource}
            />
          }
          {
            page === 'creating' &&
            <div style={{ textAlign: 'center', paddingTop: 100 }}>
              <Icon iconName="CloudAdd" className={creatingIconClass} />
              <h1>{props.updateResource?.id ? 'Updating' : 'Creating'} {props.resourceType}...</h1>
              <p>Check the notifications panel for deployment progress.</p>
              <PrimaryButton text="Go to resource" onClick={() => { navigate(deployOperation.resourcePath); props.onClose(); }} />
            </div>
          }
        </div>
      </Panel>
    </>)
  }, [props.isOpen, page]);
  // );
};


export const CreateUpdateResourceMemo: React.FunctionComponent<CreateUpdateResourceMemoProps> = (props: CreateUpdateResourceMemoProps) => {
  const opsContext = useContext(OperationsContext);

  const updateOp = (op: Operation) => {
    console.log("Inside CreateUpdate, ops are ", opsContext.operations);
    opsContext.addOperations([op]);
  }

  // return useMemo(() => {
  return <CreateUpdateResource {...props} updateOperation={(op: Operation) => updateOp(op)} />
  // }, [props]);
}
