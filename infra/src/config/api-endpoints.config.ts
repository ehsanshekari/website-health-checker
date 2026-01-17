export interface ApiEndpointConfig {
  id: string;
  path: string;
  method: string;
  handlerPath: string;
  functionName: string;
  logGroupName: string;
  environment?: Record<string, string>;
}

export const apiEndpointsConfig: ApiEndpointConfig[] = [
  {
    id: 'StatusEndpoint',
    path: '/api/status',
    method: 'GET',
    handlerPath: 'get-status/get-status.ts',
    functionName: 'getStatus',
    logGroupName: '/aws/lambda/getStatus',
    // Environment vars will be set dynamically in the construct
  },
  {
    id: 'GetIntervalEndpoint',
    path: '/api/admin/interval',
    method: 'GET',
    handlerPath: 'get-interval/get-interval.ts',
    functionName: 'getInterval',
    logGroupName: '/aws/lambda/getInterval',
  },
  {
    id: 'UpdateIntervalEndpoint',
    path: '/api/admin/interval',
    method: 'PUT',
    handlerPath: 'update-interval/update-interval.ts',
    functionName: 'updateInterval',
    logGroupName: '/aws/lambda/updateInterval',
  },
  {
    id: 'ListWebsitesEndpoint',
    path: '/api/admin/websites',
    method: 'GET',
    handlerPath: 'list-websites/list-websites.ts',
    functionName: 'listWebsites',
    logGroupName: '/aws/lambda/listWebsites',
  },
  {
    id: 'AddWebsiteEndpoint',
    path: '/api/admin/websites',
    method: 'POST',
    handlerPath: 'add-website/add-website.ts',
    functionName: 'addWebsite',
    logGroupName: '/aws/lambda/addWebsite',
  },
  {
    id: 'DeleteWebsiteEndpoint',
    path: '/api/admin/websites/{id}',
    method: 'DELETE',
    handlerPath: 'delete-website/delete-website.ts',
    functionName: 'deleteWebsite',
    logGroupName: '/aws/lambda/deleteWebsite',
  },
];
