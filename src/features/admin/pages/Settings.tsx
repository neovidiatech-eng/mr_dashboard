import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  Share2, Phone, MessageCircle,
  Facebook, Instagram, Youtube,
  ChevronRight,
  Save,
  Settings,
  Mail,
  Loader2,
  DollarSign,
  CreditCard,
  Smartphone,
  Building2,
  MapPin,
  Plus,
  Wallet,
} from 'lucide-react';
import { SiTiktok } from 'react-icons/si';

import { useSettings } from '../hooks/useSettings';
import { message } from 'antd';
import { UpdateSettingsRequest } from '../../../types/settings';
import CustomSelect from '../../../components/ui/CustomSelect';

type Tab = 'general' | 'social' | 'contact' | 'paymentMethod';

interface PaymentRow {
  id: string;
  methodKey: string;
  customKeyName: string;
  value: string;
}

const PRESET_PAYMENT_METHODS = [
  { key: 'vodafoneCash', labelAr: 'فودافون كاش', labelEn: 'Vodafone Cash', placeholder: '01000000000', icon: Smartphone, color: '#e60000' },
  { key: 'instaPay', labelAr: 'انستاباي', labelEn: 'InstaPay', placeholder: '01000000000 / username@instapay', icon: CreditCard, color: '#6f42c1' },
  { key: 'fawry', labelAr: 'فوري', labelEn: 'Fawry', placeholder: '12345', icon: Building2, color: '#f59e0b' },
  { key: 'orangeCash', labelAr: 'أورانج كاش', labelEn: 'Orange Cash', placeholder: '01200000000', icon: Smartphone, color: '#ff7900' },
  { key: 'etisalatCash', labelAr: 'اتصالات كاش', labelEn: 'Etisalat Cash', placeholder: '01100000000', icon: Smartphone, color: '#00aa4f' },
  { key: 'wePay', labelAr: 'وي باي', labelEn: 'WE Pay', placeholder: '01500000000', icon: Smartphone, color: '#5c2d91' },
  { key: 'bankAccount', labelAr: 'حساب بنكي', labelEn: 'Bank Account', placeholder: '1234567890 / IBAN', icon: Building2, color: '#2563eb' },
  { key: 'custom', labelAr: 'طريقة أخرى (مخصص)', labelEn: 'Other (Custom)', placeholder: 'الرقم / الحساب', icon: Wallet, color: '#64748b' },
];

export default function SettingsPage() {
  const { t } = useTranslation();

  const socialPlatforms = [
    { platform: 'facebook', label: t('facebook'), placeholder: 'https://facebook.com/mrmahmoud', icon: Facebook, color: '#1877f2' },
    { platform: 'youtube', label: t('youtube', 'YouTube'), placeholder: 'https://youtube.com/@mrmahmoud', icon: Youtube, color: '#ff0000' },
    { platform: 'whatsapp', label: t('whatsapp', 'WhatsApp'), placeholder: '+201000000000', icon: MessageCircle, color: '#25d366' },
    { platform: 'instagram', label: t('instagram'), placeholder: 'https://instagram.com/...', icon: Instagram, color: '#e1306c' },
    { platform: 'tiktok', label: t('tiktok'), placeholder: 'https://tiktok.com/...', icon: SiTiktok, color: '#000000' },
  ];

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'general', label: t('generalTab'), icon: Settings },
    { id: 'social', label: t('socialMediaTab'), icon: Share2 },
    { id: 'contact', label: t('contactTab'), icon: Phone },
    { id: 'paymentMethod', label: t('paymentMethodTab', 'Payment Methods'), icon: DollarSign },
  ];
  const { language } = useLanguage();
  const primaryColor = '#800020';
  const { settings: apiSettings, isLoading, updateSettings: apiUpdateSettings } = useSettings();

  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [formData, setFormData] = useState<UpdateSettingsRequest>({});
  const [paymentRows, setPaymentRows] = useState<PaymentRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (apiSettings) {
      const pm = apiSettings.paymentMethods || {};
      const rows: PaymentRow[] = Object.entries(pm).map(([k, v]) => {
        const isPreset = PRESET_PAYMENT_METHODS.some(p => p.key === k && p.key !== 'custom');
        return {
          id: Math.random().toString(36).substring(7),
          methodKey: isPreset ? k : 'custom',
          customKeyName: isPreset ? '' : k,
          value: typeof v === 'string' ? v : String(v || ''),
        };
      });

      setPaymentRows(
        rows.length > 0
          ? rows
          : [{ id: Math.random().toString(36).substring(7), methodKey: 'vodafoneCash', customKeyName: '', value: '' }]
      );

      setFormData({
        userPrefix: apiSettings.userPrefix || '',
        socialLinks: apiSettings.socialLinks || {},
        contactInfo: apiSettings.contactInfo || {},
        paymentMethods: apiSettings.paymentMethods || {},
      });
    }
  }, [apiSettings]);

  const updatePaymentMethodsFromRows = (newRows: PaymentRow[]) => {
    setPaymentRows(newRows);
    const newPm: Record<string, string> = {};
    newRows.forEach(row => {
      const key = row.methodKey === 'custom' ? row.customKeyName.trim() : row.methodKey;
      if (key) {
        newPm[key] = row.value;
      }
    });
    setFormData(prev => ({
      ...prev,
      paymentMethods: newPm,
    }));
  };

  const handleAddPaymentRow = () => {
    // Pick the first unused preset method or default to vodafoneCash
    const usedKeys = paymentRows.map(r => r.methodKey);
    const nextAvailable = PRESET_PAYMENT_METHODS.find(p => p.key !== 'custom' && !usedKeys.includes(p.key));
    const newRow: PaymentRow = {
      id: Math.random().toString(36).substring(7),
      methodKey: nextAvailable ? nextAvailable.key : 'vodafoneCash',
      customKeyName: '',
      value: '',
    };
    updatePaymentMethodsFromRows([...paymentRows, newRow]);
  };

  const handleRowChange = (id: string, field: keyof PaymentRow, val: string) => {
    const updated = paymentRows.map(r => {
      if (r.id === id) {
        return { ...r, [field]: val };
      }
      return r;
    });
    updatePaymentMethodsFromRows(updated);
  };

  const paymentSelectOptions = useMemo(() => {
    return PRESET_PAYMENT_METHODS.map(preset => {
      const IconComp = preset.icon;
      const labelText = language === 'ar' ? preset.labelAr : preset.labelEn;
      return {
        value: preset.key,
        searchText: labelText,
        label: (
          <div className="flex items-center gap-2.5 py-0.5">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border"
              style={{ backgroundColor: preset.color + '15', borderColor: preset.color + '30', color: preset.color }}
            >
              <IconComp className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-gray-800">{labelText}</span>
          </div>
        ),
      };
    });
  }, [language]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiUpdateSettings(formData);
      message.success(t('settingsUpdated', 'Settings updated successfully'));
    } catch (error) {
      message.error(t('settingsUpdateFailed', 'Failed to update settings'));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('settingsTitle', 'Settings')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('settingsDesc', 'Customize your platform and configure settings')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm text-white active:scale-95`}
            style={{ backgroundColor: primaryColor }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? t('saving', 'Saving...') : t('saveChanges', 'Save Changes')}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-1 sticky top-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? '' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                style={activeTab === tab.id ? { backgroundColor: primaryColor + '15', color: primaryColor } : {}}
              >
                <tab.icon className="w-4 h-4" />
                <span className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t(tab.id + 'Tab', tab.label)}</span>
                {activeTab === tab.id && <ChevronRight className={`w-3 h-3 ${language === 'ar' ? 'rotate-180' : ''}`} />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* General */}
          {activeTab === 'general' && (
            <SectionCard title={t("general")} icon={Settings} primaryColor={primaryColor}>
              <div className="max-w-md">
                <FieldGroup label={t('userIdPrefix', 'User Prefix')}>
                  <input
                    type="text"
                    value={formData.userPrefix || ''}
                    onChange={e => setFormData({ ...formData, userPrefix: e.target.value })}
                    className={inputCls}
                    placeholder="mr_mahmoud"
                  />
                </FieldGroup>
              </div>
            </SectionCard>
          )}

          {/* Social */}
          {activeTab === 'social' && (
            <SectionCard title={t("links")} icon={Share2} primaryColor={primaryColor}>
              <div className="space-y-4">
                {socialPlatforms.map(({ platform, label, placeholder, icon: Icon, color }) => (
                  <div key={platform} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                      <input
                        type="text"
                        value={(formData.socialLinks as any)?.[platform] || ''}
                        onChange={e => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, [platform]: e.target.value } as any
                        })}
                        className="w-full text-sm border-none p-0 focus:ring-0"
                        placeholder={placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Contact */}
          {activeTab === 'contact' && (
            <SectionCard title={t("contactInformation")} icon={Phone} primaryColor={primaryColor}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    {t('email', 'Email')}
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    value={formData.contactInfo?.email || ''}
                    onChange={e => setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo,
                        email: e.target.value
                      }
                    })}
                    className={inputCls}
                    placeholder="info@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    {t('phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={formData.contactInfo?.phone || ''}
                    onChange={e => setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo,
                        phone: e.target.value
                      }
                    })}
                    className={inputCls}
                    placeholder="+201000000000"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    {t('address', 'Address')}
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo?.address || ''}
                    onChange={e => setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo,
                        address: e.target.value
                      }
                    })}
                    className={inputCls}
                    placeholder="Cairo, Egypt"
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* Payment Methods (Dynamic Dropdown Repeater) */}
          {activeTab === 'paymentMethod' && (
            <SectionCard title={t("paymentMethodTab", "Payment Methods")} icon={DollarSign} primaryColor={primaryColor}>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{t("paymentMethodTab", "طرق الدفع المتاحة")}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t("paymentMethodsDesc", "إدارة أرقام وحسابات الدفع للاشتراكات")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPaymentRow}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white transition-all shadow-xs active:scale-95 self-start sm:self-auto cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Plus className="w-4 h-4" />
                    {t("addPaymentMethod", "إضافة طريقة دفع")}
                  </button>
                </div>

                {paymentRows.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">{t("noPaymentMethodsAdded", "لم تتم إضافة أي طريقة دفع بعد.")}</p>
                    <button
                      type="button"
                      onClick={handleAddPaymentRow}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white transition-all cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t("addPaymentMethod", "إضافة طريقة دفع")}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {paymentRows.map((row) => {
                      const selectedPreset = PRESET_PAYMENT_METHODS.find(p => p.key === row.methodKey);
                      const placeholder = selectedPreset?.placeholder || (language === 'ar' ? 'الرقم / الحساب' : 'Number / Account');

                      return (
                        <div
                          key={row.id}
                          className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-gray-200 hover:shadow-xs transition-all flex flex-col md:flex-row items-stretch md:items-center gap-3.5"
                        >
                          {/* Method Selector Dropdown using CustomSelect */}
                          <div className="w-full md:w-64 shrink-0">
                            <label className="block text-[11px] font-bold text-gray-400 mb-1 md:hidden">
                              {t("selectPaymentMethod", "طريقة الدفع")}
                            </label>
                            <CustomSelect
                              value={row.methodKey}
                              onChange={(val: string) => handleRowChange(row.id, 'methodKey', val)}
                              options={paymentSelectOptions}
                              placeholder={t("selectPaymentMethod", "اختر طريقة الدفع")}
                              className="rounded-2xl border border-gray-200 bg-white shadow-2xs"
                            />
                          </div>

                          {/* Custom Key Name (If 'custom' is selected) */}
                          {row.methodKey === 'custom' && (
                            <div className="w-full md:w-48 shrink-0">
                              <label className="block text-[11px] font-bold text-gray-400 mb-1 md:hidden">
                                {t("customMethodName", "اسم الطريقة")}
                              </label>
                              <input
                                type="text"
                                value={row.customKeyName}
                                onChange={e => handleRowChange(row.id, 'customKeyName', e.target.value)}
                                placeholder={t("customMethodName", "اسم الطريقة (Key)")}
                                className="w-full h-[46px] px-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 shadow-2xs placeholder:text-gray-400"
                              />
                            </div>
                          )}

                          {/* Value / Number Input */}
                          <div className="flex-1 min-w-0">
                            <label className="block text-[11px] font-bold text-gray-400 mb-1 md:hidden">
                              {t("paymentNumberOrAccount", "الرقم / الحساب")}
                            </label>
                            <input
                              type="text"
                              dir="ltr"
                              value={row.value}
                              onChange={e => handleRowChange(row.id, 'value', e.target.value)}
                              placeholder={placeholder}
                              className="w-full h-[46px] px-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 shadow-2xs placeholder:text-gray-400"
                            />
                          </div>

                         
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm';

function SectionCard({ title, icon: Icon, children, primaryColor }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 px-6 py-4 border-b">
        <Icon className="w-4 h-4" style={{ color: primaryColor }} />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldGroup({ label, children }: any) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      {children}
    </div>
  );
}


