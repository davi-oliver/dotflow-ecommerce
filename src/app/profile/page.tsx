'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  Edit, 
  X,
  Plus,
  Trash2,
  Shield,
  Bell,
  CreditCard,
  Heart
} from 'lucide-react';

interface Address {
  id: number;
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Dados do perfil
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null as string | null
  });

  // Endereços de exemplo
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      type: 'home',
      name: 'Casa',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      isDefault: true
    },
    {
      id: 2,
      type: 'work',
      name: 'Trabalho',
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      isDefault: false
    }
  ]);

  // Formulário de endereço
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    type: 'home',
    name: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });

  // Carregar dados do usuário
  useEffect(() => {
    if (auth.user) {
      setProfileData({
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone || '',
        avatar: auth.user.avatar || null
      });
    }
  }, [auth.user]);

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/auth/login');
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Simular atualização (substituir por API real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validar dados
      if (!profileData.name || !profileData.email) {
        throw new Error('Nome e email são obrigatórios');
      }

      if (!profileData.email.includes('@')) {
        throw new Error('Email inválido');
      }

      // Atualizar usuário
      auth.updateUser({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone
      });

      setMessage('Perfil atualizado com sucesso!');
      
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAddress) {
        // Editar endereço existente
        setAddresses(prev => prev.map(addr => 
          addr.id === editingAddress.id ? { ...addressForm, id: addr.id } : addr
        ));
      } else {
        // Adicionar novo endereço
        const newAddress = {
          ...addressForm,
          id: Date.now()
        };
        setAddresses(prev => [...prev, newAddress]);
      }

      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        type: 'home',
        name: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false
      });
      
    } catch (err) {
      setMessage('Erro ao salvar endereço');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = (id: number) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const handleSetDefaultAddress = (id: number) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      type: address.type,
      name: address.name,
      street: address.street,
      number: address.number,
      complement: address.complement || '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <>
      {/* Header da Página */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Meu Perfil
            </h1>
            <p className="text-lg text-gray-600">
              Gerencie suas informações pessoais e endereços
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs de Navegação */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'personal', name: 'Dados Pessoais', icon: User },
              { id: 'addresses', name: 'Endereços', icon: MapPin },
              { id: 'settings', name: 'Configurações', icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Mensagem de Feedback */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('sucesso') 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Tab: Dados Pessoais */}
        {activeTab === 'personal' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Pessoais</h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" className="w-20 h-20 rounded-full" />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {profileData.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Camera className="w-4 h-4 inline mr-2" />
                  Alterar foto
                </button>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="pl-10 w-full border border-gray-300 rounded-md py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="pl-10 w-full border border-gray-300 rounded-md py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="pl-10 w-full border border-gray-300 rounded-md py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {/* Botão Salvar */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab: Endereços */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            {/* Lista de Endereços */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Meus Endereços</h2>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Endereço
                </button>
              </div>

              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {address.type === 'home' ? 'Casa' : address.type === 'work' ? 'Trabalho' : 'Outro'}
                          </span>
                          {address.isDefault && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Padrão
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900">{address.name}</h3>
                        <p className="text-gray-600">
                          {address.street}, {address.number}
                          {address.complement && ` - ${address.complement}`}
                        </p>
                        <p className="text-gray-600">
                          {address.neighborhood}, {address.city} - {address.state}
                        </p>
                        <p className="text-gray-600">CEP: {address.zipCode}</p>
                      </div>
                      <div className="flex space-x-2">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Definir como padrão
                          </button>
                        )}
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulário de Endereço */}
            {showAddressForm && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingAddress ? 'Editar Endereço' : 'Novo Endereço'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de endereço
                      </label>
                      <select
                        value={addressForm.type}
                        onChange={(e) => setAddressForm({...addressForm, type: e.target.value as 'home' | 'work' | 'other'})}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="home">Casa</option>
                        <option value="work">Trabalho</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do endereço
                      </label>
                      <input
                        type="text"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Casa, Trabalho"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rua
                      </label>
                      <input
                        type="text"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nome da rua"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número
                      </label>
                      <input
                        type="text"
                        value={addressForm.number}
                        onChange={(e) => setAddressForm({...addressForm, number: e.target.value})}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={addressForm.complement}
                        onChange={(e) => setAddressForm({...addressForm, complement: e.target.value})}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Apto, bloco, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={addressForm.neighborhood}
                        onChange={(e) => setAddressForm({...addressForm, neighborhood: e.target.value})}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nome do bairro"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nome da cidade"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="SP"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="01234-567"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="default"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="default" className="ml-2 block text-sm text-gray-900">
                      Definir como endereço padrão
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Salvando...' : (editingAddress ? 'Atualizar' : 'Adicionar')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab: Configurações */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações</h2>
            
            <div className="space-y-6">
              {/* Notificações */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notificações
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Receber notificações de pedidos</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Receber ofertas e promoções</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Receber newsletter</span>
                  </label>
                </div>
              </div>

              {/* Privacidade */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Privacidade
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Compartilhar dados para melhorar a experiência</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Permitir cookies de terceiros</span>
                  </label>
                </div>
              </div>

              {/* Ações */}
              <div className="pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center">
                    <CreditCard className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-700">Gerenciar métodos de pagamento</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center">
                    <Heart className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-700">Ver favoritos</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 border border-red-200 rounded-lg hover:bg-red-50 flex items-center text-red-600">
                    <Trash2 className="w-4 h-4 mr-3" />
                    <span>Excluir conta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 