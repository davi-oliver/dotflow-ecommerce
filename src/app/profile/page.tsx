'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { dotflowAPI } from '@/lib/dotflow-api';
import { CustomerAddress, CreditCard as CreditCardType } from '@/types/dotflow';
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
  Heart,
  Lock
} from 'lucide-react';

// Interface local para compatibilidade com o formulário
interface AddressForm {
  id?: number;
  type: 'home' | 'work' | 'shipping' | 'billing';
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

// Interface local para formulário de cartões
interface CardForm {
  id?: number;
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardType: 'credit' | 'debit';
  isDefault: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [editingAddress, setEditingAddress] = useState<AddressForm | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  
  // Estados para cartões
  const [cards, setCards] = useState<CreditCardType[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [deletingCard, setDeletingCard] = useState<number | null>(null);
  const [editingCard, setEditingCard] = useState<CardForm | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [duplicateAddressData, setDuplicateAddressData] = useState<{
    existing: AddressForm;
    new: AddressForm;
    isLinkedToCustomer: boolean;
    customerAddress?: CustomerAddress;
  } | null>(null);

  // Dados do perfil
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null as string | null
  });

  // Endereços do cliente
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);

  // Formulário de endereço
  const [addressForm, setAddressForm] = useState<Omit<AddressForm, 'id'>>({
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

  // Formulário de cartão
  const [cardForm, setCardForm] = useState<Omit<CardForm, 'id'>>({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: 1,
    expiryYear: new Date().getFullYear(),
    cvv: '',
    cardType: 'credit',
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

  // Carregar endereços do cliente
  const loadAddresses = async () => {
    if (!auth.user?.id) return;
    
    setAddressesLoading(true);
    try {
      const response = await dotflowAPI.getAddressesByCustomer(auth.user.id);
      setAddresses(response.addresses);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      setMessage('Erro ao carregar endereços. Verifique sua conexão.');
    } finally {
      setAddressesLoading(false);
    }
  };

  // Carregar endereços quando o usuário estiver logado
  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.id) {
      loadAddresses();
      loadCards();
    }
  }, [auth.isAuthenticated, auth.user?.id]);

  // Carregar cartões do cliente
  const loadCards = async () => {
    if (!auth.user?.id) return;
    
    setCardsLoading(true);
    try {
      const response = await dotflowAPI.getCardsByCustomer(auth.user.id);
      setCards(response.cards);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      setMessage('Erro ao carregar cartões. Verifique sua conexão.');
    } finally {
      setCardsLoading(false);
    }
  };

  // Função para verificar se já existe endereço com mesma rua, número e bairro
  const checkDuplicateAddress = async (street: string, number: string, neighborhood: string) => {
    setCheckingDuplicates(true);
    try {
      // Buscar todos os endereços para verificar duplicatas
      const allAddressesResponse = await dotflowAPI.getAddresses();
      const duplicateAddress = allAddressesResponse.addresses.find(
        addr => addr.street.toLowerCase().trim() === street.toLowerCase().trim() && 
                addr.number.trim() === number.trim() &&
                addr.neighborhood.toLowerCase().trim() === neighborhood.toLowerCase().trim()
      );
      
      if (duplicateAddress) {
        // Verificar se já está vinculado ao cliente atual
        const customerAddresses = addresses.find(
          ca => ca.address_id === duplicateAddress.id
        );
        
        return {
          exists: true,
          address: duplicateAddress,
          isLinkedToCustomer: !!customerAddresses,
          customerAddress: customerAddresses
        };
      }
      
      return { exists: false };
    } catch (error) {
      console.error('Erro ao verificar endereço duplicado:', error);
      return { exists: false, error: true };
    } finally {
      setCheckingDuplicates(false);
    }
  };

  // Função para converter Address para AddressForm
  const convertAddressToForm = (address: { id?: number; street: string; number: string; complement?: string; neighborhood: string; city: string; state: string; zip_code: string }): AddressForm => {
    return {
      id: address.id,
      type: 'home', // Default, será ajustado se necessário
      name: 'Endereço', // Default
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.zip_code,
      isDefault: false // Default
    };
  };

  // Função para comparar dados do endereço
  const compareAddressData = (existing: AddressForm, newData: AddressForm) => {
    const differences = [];
    
    if (existing.complement !== newData.complement) {
      differences.push(`Complemento: "${existing.complement || 'N/A'}" → "${newData.complement || 'N/A'}"`);
    }
    if (existing.city !== newData.city) {
      differences.push(`Cidade: "${existing.city}" → "${newData.city}"`);
    }
    if (existing.state !== newData.state) {
      differences.push(`Estado: "${existing.state}" → "${newData.state}"`);
    }
    if (existing.zipCode !== newData.zipCode) {
      differences.push(`CEP: "${existing.zipCode}" → "${newData.zipCode}"`);
    }
    
    return differences;
  };

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
    if (!auth.user?.id) return;
    
    setLoading(true);
    setMessage('');

    try {
      if (editingAddress) {
        // Editar endereço existente
        const addressData = {
          street: addressForm.street,
          number: addressForm.number,
          complement: addressForm.complement,
          neighborhood: addressForm.neighborhood,
          city: addressForm.city,
          state: addressForm.state,
          country: 'Brasil',
          zip_code: addressForm.zipCode
        };

        await dotflowAPI.updateAddress(editingAddress.id!, addressData);
        
        // Se mudou para padrão, atualizar na API
        if (addressForm.isDefault) {
          await dotflowAPI.setPrimaryAddress(editingAddress.id!);
        }
        
        setMessage('Endereço atualizado com sucesso!');
      } else {
        // Verificar se já existe endereço com mesma rua, número e bairro
        const duplicateCheck = await checkDuplicateAddress(addressForm.street, addressForm.number, addressForm.neighborhood);
        
        if (duplicateCheck.error) {
          setMessage('Erro ao verificar endereços existentes. Tente novamente.');
          return;
        }
        
        if (duplicateCheck.exists && duplicateCheck.address) {
          // Converter Address para AddressForm
          const existingAddressForm = convertAddressToForm(duplicateCheck.address);
          
          // Verificar se há diferenças nos dados
          const differences = compareAddressData(existingAddressForm, addressForm);
          
          if (differences.length > 0) {
            // Há diferenças - mostrar modal para escolher
            setDuplicateAddressData({
              existing: existingAddressForm,
              new: addressForm,
              isLinkedToCustomer: duplicateCheck.isLinkedToCustomer,
              customerAddress: duplicateCheck.customerAddress
            });
            setShowDuplicateModal(true);
            return; // Não continuar o processo, aguardar escolha do usuário
          } else {
            // Dados idênticos - usar lógica anterior
            if (duplicateCheck.isLinkedToCustomer) {
              // Já está vinculado ao cliente
              const existingCustomerAddress = duplicateCheck.customerAddress!;
              
              // Verificar se precisa definir como principal
              if (addressForm.isDefault && !existingCustomerAddress.is_primary) {
                await dotflowAPI.setPrimaryAddress(existingCustomerAddress.id);
                setMessage('Endereço já cadastrado e definido como principal!');
              } else if (addressForm.isDefault && existingCustomerAddress.is_primary) {
                setMessage('Endereço já cadastrado e já é o principal!');
              } else {
                setMessage('Endereço já cadastrado!');
              }
            } else {
              // Existe mas não está vinculado ao cliente - vincular
              await dotflowAPI.addAddressToCustomer({
                customer_id: auth.user.id,
                address_id: duplicateCheck.address!.id,
                address_type: addressForm.type,
                label: addressForm.name
              });

              // Se for padrão, definir como principal
              if (addressForm.isDefault) {
                await dotflowAPI.setPrimaryAddress(duplicateCheck.address!.id);
              }
              
              setMessage('Endereço vinculado com sucesso!');
            }
          }
        } else {
          // Endereço não existe - criar novo
          const addressData = {
            street: addressForm.street,
            number: addressForm.number,
            complement: addressForm.complement,
            neighborhood: addressForm.neighborhood,
            city: addressForm.city,
            state: addressForm.state,
            country: 'Brasil',
            zip_code: addressForm.zipCode
          };

          const newAddressResponse = await dotflowAPI.createAddress(addressData);
          
          // Associar endereço ao cliente
          await dotflowAPI.addAddressToCustomer({
            customer_id: auth.user.id,
            address_id: newAddressResponse.address.id,
            address_type: addressForm.type,
            label: addressForm.name
          });

          // Se for padrão, definir como principal
          if (addressForm.isDefault) {
            await dotflowAPI.setPrimaryAddress(newAddressResponse.address.id);
          }
          
          setMessage('Endereço adicionado com sucesso!');
        }
      }

      // Recarregar endereços
      await loadAddresses();

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
      console.error('Erro ao salvar endereço:', err);
      setMessage('Erro ao salvar endereço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (customerAddressId: number, addressLabel: string) => {
    const confirmMessage = `Tem certeza que deseja excluir o endereço "${addressLabel}"?\n\nEsta ação não pode ser desfeita.`;
    
    if (!confirm(confirmMessage)) return;
    
    setDeletingAddress(customerAddressId);
    setMessage('');
    
    try {
      // Primeiro, encontrar o endereço para obter o ID do endereço real
      const customerAddress = addresses.find(addr => addr.id === customerAddressId);
      if (!customerAddress) {
        throw new Error('Endereço não encontrado');
      }
      
      // Deletar o endereço (isso também remove a associação com o cliente)
      await dotflowAPI.deleteAddress(customerAddress.address_id);
      setMessage('Endereço excluído com sucesso!');
      await loadAddresses();
    } catch (error) {
      console.error('Erro ao excluir endereço:', error);
      setMessage('Erro ao excluir endereço. Tente novamente.');
    } finally {
      setDeletingAddress(null);
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    setLoading(true);
    try {
      await dotflowAPI.setPrimaryAddress(id);
      setMessage('Endereço definido como padrão!');
      await loadAddresses();
    } catch (error) {
      console.error('Erro ao definir endereço padrão:', error);
      setMessage('Erro ao definir endereço padrão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (customerAddress: CustomerAddress) => {
    const address = customerAddress.address;
    setEditingAddress({
      id: customerAddress.id,
      type: customerAddress.address_type,
      name: customerAddress.label,
      street: address.street,
      number: address.number,
      complement: address.complement || '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.zip_code,
      isDefault: customerAddress.is_primary
    });
    setShowAddressForm(true);
  };

  // Função para atualizar endereço existente
  const handleUpdateExistingAddress = async () => {
    if (!duplicateAddressData || !auth.user?.id) return;
    
    setLoading(true);
    try {
      const { existing, new: newData, isLinkedToCustomer } = duplicateAddressData;
      
      // Atualizar dados do endereço
      const addressData = {
        street: newData.street,
        number: newData.number,
        complement: newData.complement,
        neighborhood: newData.neighborhood,
        city: newData.city,
        state: newData.state,
        country: 'Brasil',
        zip_code: newData.zipCode
      };

      if (existing.id) {
        await dotflowAPI.updateAddress(existing.id, addressData);
        
        if (!isLinkedToCustomer) {
          // Vincular ao cliente se não estiver vinculado
          await dotflowAPI.addAddressToCustomer({
            customer_id: auth.user.id,
            address_id: existing.id,
            address_type: newData.type,
            label: newData.name
          });
        }
      }
      
      // Definir como principal se solicitado
      if (newData.isDefault && existing.id) {
        await dotflowAPI.setPrimaryAddress(existing.id);
      }
      
      setMessage('Endereço atualizado com sucesso!');
      await loadAddresses();
      
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      setMessage('Erro ao atualizar endereço. Tente novamente.');
    } finally {
      setLoading(false);
      setShowDuplicateModal(false);
      setDuplicateAddressData(null);
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
    }
  };

  // Função para criar novo endereço
  const handleCreateNewAddress = async () => {
    if (!duplicateAddressData || !auth.user?.id) return;
    
    setLoading(true);
    try {
      const { new: newData } = duplicateAddressData;
      
      // Criar novo endereço
      const addressData = {
        street: newData.street,
        number: newData.number,
        complement: newData.complement,
        neighborhood: newData.neighborhood,
        city: newData.city,
        state: newData.state,
        country: 'Brasil',
        zip_code: newData.zipCode
      };

      const newAddressResponse = await dotflowAPI.createAddress(addressData);
      
      // Associar endereço ao cliente
      await dotflowAPI.addAddressToCustomer({
        customer_id: auth.user.id,
        address_id: newAddressResponse.address.id,
        address_type: newData.type,
        label: newData.name
      });

      // Se for padrão, definir como principal
      if (newData.isDefault) {
        await dotflowAPI.setPrimaryAddress(newAddressResponse.address.id);
      }
      
      setMessage('Novo endereço criado com sucesso!');
      await loadAddresses();
      
    } catch (error) {
      console.error('Erro ao criar novo endereço:', error);
      setMessage('Erro ao criar novo endereço. Tente novamente.');
    } finally {
      setLoading(false);
      setShowDuplicateModal(false);
      setDuplicateAddressData(null);
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
    }
  };

  // Funções para gerenciar cartões
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user?.id) return;
    
    setLoading(true);
    setMessage('');

    try {
      if (editingCard) {
        // Editar cartão existente
        const cardData = {
          holder_name: cardForm.cardHolderName,
          is_default: cardForm.isDefault
        };

        await dotflowAPI.updateCard(editingCard.id!, cardData);
        
        // Se mudou para padrão, atualizar na API
        if (cardForm.isDefault) {
          await dotflowAPI.setDefaultCard(editingCard.id!);
        }
        
        setMessage('Cartão atualizado com sucesso!');
      } else {
        // Criar novo cartão
        const cardData = {
          customer_id: auth.user.id,
          card_token: generateCardToken(cardForm.cardNumber, cardForm.cvv), // Simular token
          card_type: cardForm.cardType,
          brand: getCardBrand(cardForm.cardNumber),
          last_four_digits: cardForm.cardNumber.slice(-4),
          holder_name: cardForm.cardHolderName,
          expiry_month: cardForm.expiryMonth,
          expiry_year: cardForm.expiryYear,
          gateway: 'stripe',
          is_default: cardForm.isDefault
        };

        await dotflowAPI.createCard(cardData);
        setMessage('Cartão adicionado com sucesso!');
      }

      // Recarregar cartões
      await loadCards();

      setShowCardForm(false);
      setEditingCard(null);
      setCardForm({
        cardNumber: '',
        cardHolderName: '',
        expiryMonth: 1,
        expiryYear: new Date().getFullYear(),
        cvv: '',
        cardType: 'credit',
        isDefault: false
      });
      
    } catch (err) {
      console.error('Erro ao salvar cartão:', err);
      setMessage('Erro ao salvar cartão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: number, cardLabel: string) => {
    const confirmMessage = `Tem certeza que deseja excluir o cartão "${cardLabel}"?\n\nEsta ação não pode ser desfeita.`;
    
    if (!confirm(confirmMessage)) return;
    
    setDeletingCard(cardId);
    setMessage('');
    
    try {
      // Deletar o cartão
      await dotflowAPI.deleteCard(cardId);
      setMessage('Cartão excluído com sucesso!');
      await loadCards();
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
      setMessage('Erro ao excluir cartão. Tente novamente.');
    } finally {
      setDeletingCard(null);
    }
  };

  const handleSetDefaultCard = async (id: number) => {
    setLoading(true);
    try {
      await dotflowAPI.setDefaultCard(id);
      setMessage('Cartão definido como padrão!');
      await loadCards();
    } catch (error) {
      console.error('Erro ao definir cartão padrão:', error);
      setMessage('Erro ao definir cartão padrão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCard = (card: CreditCardType) => {
    setEditingCard({
      id: card.id,
      cardNumber: `**** **** **** ${card.last_four_digits}`,
      cardHolderName: card.holder_name,
      expiryMonth: card.expiry_month,
      expiryYear: card.expiry_year,
      cvv: '',
      cardType: card.card_type,
      isDefault: card.is_default || false
    });
    setShowCardForm(true);
  };

  // Função para detectar a bandeira do cartão
  const getCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6/.test(number)) return 'elo';
    if (/^606282|^3841/.test(number)) return 'hipercard';
    if (/^3[068]/.test(number)) return 'diners';
    if (/^6(?:011|5)/.test(number)) return 'discover';
    if (/^35/.test(number)) return 'jcb';
    if (/^50/.test(number)) return 'aura';
    
    return 'visa'; // Default
  };

  // Função para obter o ícone da bandeira do cartão
  const getCardBrandIcon = (cardNumber: string) => {
    const brand = getCardBrand(cardNumber);
    
    switch (brand) {
      case 'visa':
        return (
          <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold tracking-wide">VISA</span>
          </div>
        );
      case 'mastercard':
        return (
          <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded flex items-center justify-center shadow-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        );
      case 'amex':
        return (
          <div className="w-8 h-5 bg-gradient-to-r from-green-600 to-green-800 rounded flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">AMEX</span>
          </div>
        );
      case 'elo':
        return (
          <div className="w-8 h-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">ELO</span>
          </div>
        );
      case 'diners':
        return (
          <div className="w-8 h-5 bg-gradient-to-r from-purple-600 to-purple-800 rounded flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">DC</span>
          </div>
        );
      case 'discover':
        return (
          <div className="w-8 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">DISC</span>
          </div>
        );
      case 'jcb':
        return (
          <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-red-700 rounded flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">JCB</span>
          </div>
        );
      case 'hipercard':
        return (
          <div className="w-8 h-5 bg-gradient-to-r from-pink-500 to-pink-700 rounded flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">HC</span>
          </div>
        );
      case 'aura':
        return (
          <div className="w-8 h-5 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">AURA</span>
          </div>
        );
      default:
        return <CreditCard className="w-4 h-4 text-gray-400" />;
    }
  };

  // Função para gerar token simulado (em produção, usar gateway real)
  const generateCardToken = (cardNumber: string, cvv: string): string => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    const timestamp = Date.now();
    return `tok_${cleanNumber.slice(-4)}_${cvv}_${timestamp}`;
  };

  // Função para formatar número do cartão
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
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
          <nav className="-mb-px flex flex-wrap gap-2 sm:gap-4 lg:gap-8">
            {[
              { id: 'personal', name: 'Dados Pessoais', icon: User, shortName: 'Dados' },
              { id: 'addresses', name: 'Endereços', icon: MapPin, shortName: 'Endereços' },
              { id: 'cards', name: 'Meus Cartões', icon: CreditCard, shortName: 'Cartões' },
              { id: 'settings', name: 'Configurações', icon: Shield, shortName: 'Config' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 sm:space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden">{tab.shortName}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Mensagem de Feedback */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('sucesso') || message.includes('cadastrado') || message.includes('vinculado')
              ? 'bg-green-50 border border-green-200 text-green-800'
              : message.includes('já é o principal')
              ? 'bg-blue-50 border border-blue-200 text-blue-800'
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

              {addressesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando endereços...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum endereço cadastrado</p>
                  <p className="text-sm text-gray-500">Adicione seu primeiro endereço para facilitar suas compras</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((customerAddress) => {
                    const address = customerAddress.address;
                    return (
                      <div key={customerAddress.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {customerAddress.address_type === 'home' ? 'Casa' : 
                                 customerAddress.address_type === 'work' ? 'Trabalho' : 
                                 customerAddress.address_type === 'shipping' ? 'Entrega' : 
                                 customerAddress.address_type === 'billing' ? 'Cobrança' : 'Outro'}
                              </span>
                              {customerAddress.is_primary && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Padrão
                                </span>
                              )}
                            </div>
                            <h3 className="font-medium text-gray-900">{customerAddress.label}</h3>
                            <p className="text-gray-600">
                              {address.street}, {address.number}
                              {address.complement && ` - ${address.complement}`}
                            </p>
                            <p className="text-gray-600">
                              {address.neighborhood}, {address.city} - {address.state}
                            </p>
                            <p className="text-gray-600">CEP: {address.zip_code}</p>
                          </div>
                          <div className="flex space-x-2">
                            {!customerAddress.is_primary && (
                              <button
                                onClick={() => handleSetDefaultAddress(customerAddress.id)}
                                disabled={deletingAddress === customerAddress.id}
                                className={`text-sm ${
                                  deletingAddress === customerAddress.id 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-blue-600 hover:text-blue-700'
                                }`}
                              >
                                Definir como padrão
                              </button>
                            )}
                            <button
                              onClick={() => handleEditAddress(customerAddress)}
                              disabled={deletingAddress === customerAddress.id}
                              className={`${
                                deletingAddress === customerAddress.id 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-gray-600 hover:text-gray-700'
                              }`}
                              title={deletingAddress === customerAddress.id ? 'Aguarde...' : 'Editar endereço'}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(customerAddress.id, customerAddress.label)}
                              disabled={deletingAddress === customerAddress.id}
                              className={`${
                                deletingAddress === customerAddress.id 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-red-600 hover:text-red-700'
                              }`}
                              title={deletingAddress === customerAddress.id ? 'Excluindo...' : 'Excluir endereço'}
                            >
                              {deletingAddress === customerAddress.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                        onChange={(e) => setAddressForm({...addressForm, type: e.target.value as 'home' | 'work' | 'shipping' | 'billing'})}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="home">Casa</option>
                        <option value="work">Trabalho</option>
                        <option value="shipping">Entrega</option>
                        <option value="billing">Cobrança</option>
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
                      disabled={loading || checkingDuplicates}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {checkingDuplicates ? 'Verificando...' : 
                       loading ? 'Salvando...' : 
                       (editingAddress ? 'Atualizar' : 'Adicionar')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab: Meus Cartões */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            {/* Lista de Cartões */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Meus Cartões</h2>
                <button
                  onClick={() => setShowCardForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center sm:justify-start w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Cartão
                </button>
              </div>

              {cardsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando cartões...</p>
                </div>
              ) : cards.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum cartão cadastrado</p>
                  <p className="text-sm text-gray-500">Adicione seu primeiro cartão para facilitar suas compras</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cards.map((card) => {
                    return (
                      <div key={card.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {card.brand.toUpperCase()}
                              </span>
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                {card.card_type === 'credit' ? 'Crédito' : 'Débito'}
                              </span>
                              {card.is_default && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Padrão
                                </span>
                              )}
                            </div>
                            <h3 className="font-medium text-gray-900">
                              {card.card_type === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'}
                            </h3>
                            <p className="text-gray-600">
                              **** **** **** {card.last_four_digits}
                            </p>
                            <p className="text-gray-600">
                              {card.holder_name}
                            </p>
                            <p className="text-gray-600">
                              {card.expiry_month.toString().padStart(2, '0')}/{card.expiry_year}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                            {!card.is_default && (
                              <button
                                onClick={() => handleSetDefaultCard(card.id)}
                                disabled={deletingCard === card.id}
                                className={`text-sm px-2 py-1 rounded ${
                                  deletingCard === card.id 
                                    ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                                }`}
                              >
                                <span className="hidden sm:inline">Definir como padrão</span>
                                <span className="sm:hidden">Padrão</span>
                              </button>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditCard(card)}
                                disabled={deletingCard === card.id}
                                className={`p-2 rounded ${
                                  deletingCard === card.id 
                                    ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                                    : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                                title={deletingCard === card.id ? 'Aguarde...' : 'Editar cartão'}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCard(card.id, `${card.card_type === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'}`)}
                                disabled={deletingCard === card.id}
                                className={`p-2 rounded ${
                                  deletingCard === card.id 
                                    ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                }`}
                                title={deletingCard === card.id ? 'Excluindo...' : 'Excluir cartão'}
                              >
                                {deletingCard === card.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Formulário de Cartão */}
            {showCardForm && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingCard ? 'Editar Cartão' : 'Novo Cartão'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCardForm(false);
                      setEditingCard(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número do cartão
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                          {cardForm.cardNumber ? getCardBrandIcon(cardForm.cardNumber) : <CreditCard className="w-4 h-4 text-gray-400" />}
                        </div>
                        <input
                          type="text"
                          value={cardForm.cardNumber}
                          onChange={(e) => setCardForm({...cardForm, cardNumber: formatCardNumber(e.target.value)})}
                          className="pl-12 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome no cartão
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={cardForm.cardHolderName}
                          onChange={(e) => setCardForm({...cardForm, cardHolderName: e.target.value.toUpperCase()})}
                          className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="NOME COMO NO CARTÃO"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mês
                      </label>
                      <select
                        value={cardForm.expiryMonth}
                        onChange={(e) => setCardForm({...cardForm, expiryMonth: parseInt(e.target.value)})}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Array.from({length: 12}, (_, i) => (
                          <option key={i+1} value={i+1}>
                            {(i+1).toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ano
                      </label>
                      <select
                        value={cardForm.expiryYear}
                        onChange={(e) => setCardForm({...cardForm, expiryYear: parseInt(e.target.value)})}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Array.from({length: 10}, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={cardForm.cvv}
                          onChange={(e) => setCardForm({...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                          className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de cartão
                      </label>
                      <select
                        value={cardForm.cardType}
                        onChange={(e) => setCardForm({...cardForm, cardType: e.target.value as 'credit' | 'debit'})}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="credit">Cartão de Crédito</option>
                        <option value="debit">Cartão de Débito</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="defaultCard"
                      checked={cardForm.isDefault}
                      onChange={(e) => setCardForm({...cardForm, isDefault: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="defaultCard" className="ml-2 block text-sm text-gray-900">
                      Definir como cartão padrão
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCardForm(false);
                        setEditingCard(null);
                      }}
                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Salvando...' : (editingCard ? 'Atualizar' : 'Adicionar')}
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

      {/* Modal de Confirmação para Endereços Duplicados */}
      {showDuplicateModal && duplicateAddressData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Endereço Similar Encontrado
              </h3>
              <button
                onClick={() => {
                  setShowDuplicateModal(false);
                  setDuplicateAddressData(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Encontramos um endereço com a mesma rua, número e bairro, mas com algumas informações diferentes:
              </p>

              {/* Endereço Existente */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Endereço Existente:</h4>
                <p className="text-sm text-gray-600">
                  {duplicateAddressData.existing.street}, {duplicateAddressData.existing.number}
                  {duplicateAddressData.existing.complement && ` - ${duplicateAddressData.existing.complement}`}
                </p>
                <p className="text-sm text-gray-600">
                  {duplicateAddressData.existing.neighborhood}, {duplicateAddressData.existing.city} - {duplicateAddressData.existing.state}
                </p>
                <p className="text-sm text-gray-600">CEP: {duplicateAddressData.existing.zipCode}</p>
              </div>

              {/* Endereço Novo */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Novo Endereço:</h4>
                <p className="text-sm text-gray-600">
                  {duplicateAddressData.new.street}, {duplicateAddressData.new.number}
                  {duplicateAddressData.new.complement && ` - ${duplicateAddressData.new.complement}`}
                </p>
                <p className="text-sm text-gray-600">
                  {duplicateAddressData.new.neighborhood}, {duplicateAddressData.new.city} - {duplicateAddressData.new.state}
                </p>
                <p className="text-sm text-gray-600">CEP: {duplicateAddressData.new.zipCode}</p>
              </div>

              {/* Diferenças */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Diferenças encontradas:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {compareAddressData(duplicateAddressData.existing, duplicateAddressData.new).map((diff, index) => (
                    <li key={index}>• {diff}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDuplicateModal(false);
                  setDuplicateAddressData(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNewAddress}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Criando...' : 'Criar Novo Endereço'}
              </button>
              <button
                onClick={handleUpdateExistingAddress}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Atualizando...' : 'Atualizar Existente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 