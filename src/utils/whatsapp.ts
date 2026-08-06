import { ShopSettings } from '../types/crm';

export interface SendWhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends a WhatsApp message using the configured gateway mode.
 * If mode is 'api' and provider is 'ultramsg', it performs a background POST request.
 * If mode is 'direct' or credentials are missing, it returns success: false with instructions.
 */
export async function sendWhatsAppMessage(
  settings: ShopSettings,
  recipientPhone: string,
  messageText: string
): Promise<SendWhatsAppResult> {
  const mode = settings.whatsappMode || 'direct';
  const provider = settings.whatsappProvider || 'ultramsg';
  const instanceId = settings.whatsappInstanceId;
  const token = settings.whatsappToken;

  if (mode === 'api' && provider === 'ultramsg' && instanceId && token) {
    // Ultramsg expects digits only, usually with country code.
    // If it starts with 10 digits and is an Indian number, we prefix '91' automatically if missing.
    let cleanPhone = recipientPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10 && (settings.phone?.startsWith('91') || settings.phone?.startsWith('+91') || settings.whatsappBusinessPhone?.startsWith('8510002780') || settings.whatsappBusinessPhone === '8510002780')) {
      cleanPhone = '91' + cleanPhone;
    }

    try {
      const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          token: token,
          to: cleanPhone,
          body: messageText
        })
      });
      const resData = await response.json();
      if (response.ok && (resData.sent === 'true' || resData.sent === true || resData.id)) {
        return { success: true, messageId: resData.id || 'sent' };
      } else {
        return { success: false, error: typeof resData.error === 'object' ? JSON.stringify(resData.error) : String(resData.error || JSON.stringify(resData)) };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed' };
    }
  }

  return { success: false, error: 'Direct manual mode active or API credentials missing' };
}
