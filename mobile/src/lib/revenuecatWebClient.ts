// Native stub — web functionality is handled by revenuecatWebClient.web.ts

export type WebOfferings = { all: Record<string, any>; current: any | null };

export const initializeWebRevenueCat = (_userId?: string): void => {};
export const isWebRevenueCatEnabled = (): boolean => false;
export const getWebOfferings = async (): Promise<WebOfferings | null> => null;
export const purchaseWebPackage = async (_pkg: any): Promise<any | null> => null;
export const getWebCustomerInfo = async (): Promise<any | null> => null;
export const identifyWebUser = (_userId: string): void => {};
