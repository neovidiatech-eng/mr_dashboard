import { useState, useEffect } from 'react';
import {
  Share2, Phone, MessageCircle,
  Facebook, Instagram,
  ChevronRight,
  Save,
  Settings,
  Mail,
  Loader2,
} from 'lucide-react';
import { SiTiktok } from 'react-icons/si';

import { useSettings } from '../hooks/useSettings';
import { message } from 'antd';
import { UpdateSettingsRequest } from '../../../types/settings';

const socialPlatforms = [
  { platform: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...', icon: Facebook, color: '#1877f2' },
  { platform: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...', icon: Instagram, color: '#e1306c' },
  { platform: 'TikTok', label: 'TikTok', placeholder: 'https://tiktok.com/...', icon: SiTiktok, color: '#000000' },
];

type Tab = 'general' | 'social' | 'contact';

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'social', label: 'Social Media', icon: Share2 },
  { id: 'contact', label: 'Contact', icon: Phone },
];

export default function SettingsPage() {
  const primaryColor = '#2563eb';
  const { settings: apiSettings, isLoading, updateSettings: apiUpdateSettings } = useSettings();

  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [formData, setFormData] = useState<UpdateSettingsRequest>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (apiSettings) {
      setFormData({
        userPrefix: apiSettings.userPrefix,
        socialLinks: apiSettings.socialLinks,
        contactInfo: apiSettings.contactInfo
      });
    }
  }, [apiSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiUpdateSettings(formData);
      message.success('Settings updated successfully');
    } catch (error) {
      message.error('Failed to update settings');
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
    <div className="space-y-6" dir="ltr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Customize your platform and configure settings</p>
        </div>
        <div className="flex gap-2">
          {/* <button
            onClick={handleReset}
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button> */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm text-white`}
            style={{ backgroundColor: primaryColor }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
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
                <span className="flex-1 text-left">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* General */}
          {activeTab === 'general' && (
            <SectionCard title="General Settings" icon={Settings} primaryColor={primaryColor}>
              <div className="max-w-md">
                <FieldGroup label="User Prefix">
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
            <SectionCard title="Social Media Links" icon={Share2} primaryColor={primaryColor}>
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
            <SectionCard title="Contact Information" icon={Phone} primaryColor={primaryColor}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    WhatsApp
                  </h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={formData.contactInfo?.whatsapp?.phone || ''}
                      onChange={e => setFormData({
                        ...formData,
                        contactInfo: {
                          ...formData.contactInfo,
                          whatsapp: { ...formData.contactInfo?.whatsapp, phone: e.target.value, active: true }
                        } as any
                      })}
                      className={inputCls}
                      placeholder="01069441989"
                    />
                    <div
                      onClick={() => setFormData({
                        ...formData,
                        contactInfo: {
                          ...formData.contactInfo,
                          whatsapp: { ...formData.contactInfo?.whatsapp, active: !formData.contactInfo?.whatsapp?.active }
                        } as any
                      })}
                      className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${formData.contactInfo?.whatsapp?.active ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.contactInfo?.whatsapp?.active ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Email Address
                  </h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="email"
                      value={formData.contactInfo?.mail?.email || ''}
                      onChange={e => setFormData({
                        ...formData,
                        contactInfo: {
                          ...formData.contactInfo,
                          mail: { ...formData.contactInfo?.mail, email: e.target.value, active: true }
                        } as any
                      })}
                      className={inputCls}
                      placeholder="mneseym@gmail.com"
                    />
                    <div
                      onClick={() => setFormData({
                        ...formData,
                        contactInfo: {
                          ...formData.contactInfo,
                          mail: { ...formData.contactInfo?.mail, active: !formData.contactInfo?.mail?.active }
                        } as any
                      })}
                      className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${formData.contactInfo?.mail?.active ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.contactInfo?.mail?.active ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>
                </div>
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


