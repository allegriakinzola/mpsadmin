const EASYPAY_BASE_URL = "https://www.e-com-easypay.com";

export interface EasyPayInitParams {
  orderRef: string;
  amount: number;
  currency: "USD" | "CDF";
  description: string;
  customerName: string;
  customerEmail?: string;
  successUrl: string;
  errorUrl: string;
  cancelUrl: string;
  language?: "FR" | "EN";
  channels?: ("CREDIT CARD" | "MOBILE MONEY")[];
}

export interface EasyPayInitResponse {
  code: number;
  message?: string;
  reference?: string;
  transaction?: {
    order_ref: string;
    reference: string;
  };
  payment?: {
    channel: string;
    status: string;
    reference: string;
  };
}

export interface EasyPayStatusResponse {
  code: number;
  message?: string;
  transaction?: {
    order_ref: string;
    reference: string;
    status: string;
  };
  payment?: {
    channel: string;
    status: string;
    reference: string;
    amount: number;
    currency: string;
  };
}

function getEasyPayConfig() {
  const token = process.env.EASYPAY_TOKEN;
  const cid = process.env.EASYPAY_CID;
  const mode = process.env.EASYPAY_MODE || "sandbox";

  if (!token || !cid) {
    throw new Error("EasyPay credentials not configured");
  }

  return { token, cid, mode };
}

export async function initializePayment(params: EasyPayInitParams): Promise<EasyPayInitResponse> {
  const { token, cid, mode } = getEasyPayConfig();
  
  const url = `${EASYPAY_BASE_URL}/${mode}/payment/initialization?cid=${cid}&token=${token}`;
  
  const channels = params.channels || ["CREDIT CARD", "MOBILE MONEY"];
  const channelsFormatted = channels.map(c => ({ channel: c }));

  const body = {
    order_ref: params.orderRef,
    amount: params.amount,
    currency: params.currency,
    description: params.description,
    success_url: params.successUrl,
    error_url: params.errorUrl,
    cancel_url: params.cancelUrl,
    language: params.language || "FR",
    channels: channelsFormatted,
    customer_name: params.customerName,
    customer_email: params.customerEmail || "",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`EasyPay initialization failed: ${response.statusText}`);
  }

  return response.json();
}

export async function checkPaymentStatus(reference: string): Promise<EasyPayStatusResponse> {
  const { token, cid, mode } = getEasyPayConfig();
  
  const url = `${EASYPAY_BASE_URL}/${mode}/payment/${reference}/checking-status`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`EasyPay status check failed: ${response.statusText}`);
  }

  return response.json();
}

export function getPaymentRedirectUrl(reference: string): string {
  const { mode } = getEasyPayConfig();
  return `${EASYPAY_BASE_URL}/${mode}/payment/initialization?reference=${reference}`;
}
