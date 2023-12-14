export type IGetBranchRequestBody = {
  repo: string;
  branch: string;
  platform: 'wechat' | 'alipay';
};

export type IPreviewMiniprogram = {
  platform: 'wechat' | 'alipay';
  fileValue: Record<string, any>;
  previewValue: Record<string, any>;
};
