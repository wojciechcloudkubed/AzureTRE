import React, { useEffect, useState } from 'react';
import { DefaultPalette, IStackStyles, MessageBar, MessageBarType, Stack } from '@fluentui/react';
import './App.scss';
import { TopNav } from './components/shared/TopNav';
import { Routes, Route } from 'react-router-dom';
import { RootLayout } from './components/root/RootLayout';
import { WorkspaceProvider } from './components/workspaces/WorkspaceProvider';
import { MsalAuthenticationTemplate } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { Workspace } from './models/workspace';
import { AppRolesContext } from './contexts/AppRolesContext';
import { WorkspaceContext } from './contexts/WorkspaceContext';
import { GenericErrorBoundary } from './components/shared/GenericErrorBoundary';
import { OperationsContext } from './contexts/OperationsContext';
import { completedStates, Operation } from './models/operation';
import { HttpMethod, ResultType, useAuthApiCall } from './hooks/useAuthApiCall';
import { ApiEndpoint } from './models/apiEndpoints';
import { CreateUpdateResourceMemo } from './components/shared/create-update-resource/CreateUpdateResource';
import { CreateUpdateResourceContext } from './contexts/CreateUpdateResourceContext';
import { CreateFormResource, ResourceType } from './models/resourceType';
import { Footer } from './components/shared/Footer';

export const App: React.FunctionComponent = () => {
  const [appRoles, setAppRoles] = useState([] as Array<string>);
  const [selectedWorkspace, setSelectedWorkspace] = useState({} as Workspace);
  const [workspaceRoles, setWorkspaceRoles] = useState([] as Array<string>);


  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [createFormResource, setCreateFormResource] = useState({ resourceType: ResourceType.Workspace } as CreateFormResource);

  const apiCall = useAuthApiCall();

  // set the app roles
  useEffect(() => {
    const setAppRolesOnLoad = async () => {
      await apiCall(ApiEndpoint.Workspaces, HttpMethod.Get, undefined, undefined, ResultType.JSON, (roles: Array<string>) => {
        setAppRoles(roles);
      }, true);
    };
    setAppRolesOnLoad();
  }, [apiCall]);

  return (
    <>
      <Routes>
        <Route path="*" element={
          <MsalAuthenticationTemplate interactionType={InteractionType.Redirect}>
              <OperationsContextProvider>
              <CreateUpdateResourceContextProvider
              setCreateFormResource={(createFormResource: CreateFormResource) => setCreateFormResource(createFormResource)}
              setCreateFormOpen={() => setCreateFormOpen(true)}>
                <AppRolesContext.Provider value={{
                  roles: appRoles,
                  setAppRoles: (roles: Array<string>) => { setAppRoles(roles) }
                }}>
                  <CreateUpdateResourceMemo
                    isOpen={createFormOpen}
                    onClose={() => setCreateFormOpen(false)}
                    resourceType={createFormResource.resourceType}
                    parentResource={createFormResource.resourceParent}
                    onAddResource={createFormResource.onAdd}
                    workspaceApplicationIdURI={createFormResource.workspaceApplicationIdURI}
                    updateResource={createFormResource.updateResource}
                  />
                  <Stack styles={stackStyles} className='tre-root'>
                    <Stack.Item grow className='tre-top-nav'>
                      <TopNav />
                    </Stack.Item>
                    <Stack.Item grow={100} className='tre-body'>
                      <GenericErrorBoundary>
                        <Routes>
                          <Route path="*" element={<RootLayout />} />
                          <Route path="/workspaces/:workspaceId//*" element={
                            <WorkspaceContext.Provider value={{
                              roles: workspaceRoles,
                              setRoles: (roles: Array<string>) => { console.info("Workspace roles", roles); setWorkspaceRoles(roles) },
                              workspace: selectedWorkspace,
                              setWorkspace: (w: Workspace) => { console.info("Workspace set", w); setSelectedWorkspace(w) },
                              workspaceApplicationIdURI: selectedWorkspace.properties?.scope_id
                            }}>
                              <WorkspaceProvider />
                            </WorkspaceContext.Provider>
                          } />
                        </Routes>
                      </GenericErrorBoundary>
                    </Stack.Item>
                    <Stack.Item grow>
                      <Footer />
                    </Stack.Item>
                  </Stack>
                </AppRolesContext.Provider>
                </CreateUpdateResourceContextProvider>
              </OperationsContextProvider>

          </MsalAuthenticationTemplate>
        } />
        <Route path='/logout' element={
          <div className='tre-logout-message'>
            <MessageBar
              messageBarType={MessageBarType.success}
              isMultiline={true}>
              <h2>You are logged out.</h2>
              <p>It's a good idea to close your browser windows.</p>
            </MessageBar>
          </div>} />
      </Routes>
    </>
  );
};

const stackStyles: IStackStyles = {
  root: {
    background: DefaultPalette.white,
    height: '100vh',
  },
};

export const Admin: React.FunctionComponent = () => {
  return (
    <h1>Admin (wip)</h1>
  )
}


interface CreateProviderProps {
  setCreateFormResource: (createFormResource: CreateFormResource) => void,
  setCreateFormOpen: (open: boolean) => void,
  children?: JSX.Element | JSX.Element[]
}

const CreateUpdateResourceContextProvider: React.FunctionComponent<CreateProviderProps> = (props: CreateProviderProps) => {
  return (
    <CreateUpdateResourceContext.Provider value={{
      openCreateForm: (createFormResource: CreateFormResource) => {
        props.setCreateFormResource(createFormResource);
        props.setCreateFormOpen(true);
      }
    }}>
      {props.children}
    </CreateUpdateResourceContext.Provider>
  )
}


interface OperationsProviderProps {
  children?: JSX.Element | JSX.Element[]
}

const OperationsContextProvider: React.FunctionComponent<OperationsProviderProps> = (props: OperationsProviderProps) => {
  const [operations, setOperations] = useState([] as Array<Operation>);
  const apiCall = useAuthApiCall();

  useEffect(() => {
    const loadAllOps = async () => {
      let opsToAdd = (await apiCall(`${ApiEndpoint.Operations}`, HttpMethod.Get)).operations as Array<Operation>;
      setOperations(opsToAdd);
    };

    loadAllOps();
  }, [apiCall])

  return (
    <OperationsContext.Provider value={{
      operations: operations,
      addOperations: (ops: Array<Operation>) => {
        let stateOps = [...operations];

        ops.forEach((op: Operation) => {
          let i = stateOps.findIndex((f: Operation) => f.id === op.id);
          if (i !== -1) {
            stateOps.splice(i, 1, op);
          } else {
            stateOps.push(op);
          }
        });
        console.log("setting stateOps", stateOps);
        setOperations(stateOps);
      },
      dismissCompleted: () => {
        let stateOps = [...operations];
        stateOps.forEach((o: Operation) => {
          if (completedStates.includes(o.status)) {
            o.dismiss = true;
          }
        })
        setOperations(stateOps);
      }
    }}>
      {props.children}
    </OperationsContext.Provider>
  )
}
function apiCall(arg0: string, Get: HttpMethod) {
  throw new Error('Function not implemented.');
}

