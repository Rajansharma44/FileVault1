import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available languages
export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh';

// Define translations
export const translations = {
  en: {
    common: {
      search: 'Search files...',
      upload: 'Upload',
      sort: 'Sort by',
      nameAsc: 'Name (A-Z)',
      nameDesc: 'Name (Z-A)',
      newest: 'Newest first',
      oldest: 'Oldest first',
      sizeDesc: 'Size (large to small)',
      sizeAsc: 'Size (small to large)',
      cancel: 'Cancel',
      back: 'Back to Dashboard',
    },
    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark all as read',
      fileUploaded: 'File uploaded',
      fileShared: 'File shared',
      fileStarred: 'File starred',
      viewAll: 'View all notifications',
    },
    help: {
      title: 'Help & Support',
      userGuide: 'User Guide',
      userGuideDesc: 'Learn how to use the storage system',
      faq: 'FAQ',
      faqDesc: 'Commonly asked questions',
      contact: 'Contact Support',
      contactDesc: 'Get help from our team',
      report: 'Report a Problem',
      reportDesc: 'Let us know if something\'s not working',
    },
    profile: {
      title: 'My Account',
      viewProfile: 'View Profile',
      viewProfileDesc: 'View your profile information',
    },
  },
  es: {
    common: {
      search: 'Buscar archivos...',
      upload: 'Subir',
      sort: 'Ordenar por',
      nameAsc: 'Nombre (A-Z)',
      nameDesc: 'Nombre (Z-A)',
      newest: 'Más recientes',
      oldest: 'Más antiguos',
      sizeDesc: 'Tamaño (grande a pequeño)',
      sizeAsc: 'Tamaño (pequeño a grande)',
      cancel: 'Cancelar',
      back: 'Volver al Panel',
    },
    notifications: {
      title: 'Notificaciones',
      markAllRead: 'Marcar todo como leído',
      fileUploaded: 'Archivo subido',
      fileShared: 'Archivo compartido',
      fileStarred: 'Archivo destacado',
      viewAll: 'Ver todas las notificaciones',
    },
    help: {
      title: 'Ayuda y Soporte',
      userGuide: 'Guía de Usuario',
      userGuideDesc: 'Aprende a usar el sistema de almacenamiento',
      faq: 'Preguntas Frecuentes',
      faqDesc: 'Preguntas comúnmente formuladas',
      contact: 'Contactar Soporte',
      contactDesc: 'Obtén ayuda de nuestro equipo',
      report: 'Reportar un Problema',
      reportDesc: 'Haznos saber si algo no funciona',
    },
    profile: {
      title: 'Mi Cuenta',
      viewProfile: 'Ver Perfil',
      viewProfileDesc: 'Ver información de tu perfil',
    },
  },
  fr: {
    common: {
      search: 'Rechercher des fichiers...',
      upload: 'Télécharger',
      sort: 'Trier par',
      nameAsc: 'Nom (A-Z)',
      nameDesc: 'Nom (Z-A)',
      newest: 'Plus récents',
      oldest: 'Plus anciens',
      sizeDesc: 'Taille (grand à petit)',
      sizeAsc: 'Taille (petit à grand)',
      cancel: 'Annuler',
      back: 'Retour au Tableau de Bord',
    },
    notifications: {
      title: 'Notifications',
      markAllRead: 'Tout marquer comme lu',
      fileUploaded: 'Fichier téléchargé',
      fileShared: 'Fichier partagé',
      fileStarred: 'Fichier mis en favori',
      viewAll: 'Voir toutes les notifications',
    },
    help: {
      title: 'Aide et Support',
      userGuide: 'Guide Utilisateur',
      userGuideDesc: 'Apprenez à utiliser le système de stockage',
      faq: 'FAQ',
      faqDesc: 'Questions fréquemment posées',
      contact: 'Contacter le Support',
      contactDesc: 'Obtenez de l\'aide de notre équipe',
      report: 'Signaler un Problème',
      reportDesc: 'Faites-nous savoir si quelque chose ne fonctionne pas',
    },
    profile: {
      title: 'Mon Compte',
      viewProfile: 'Voir le Profil',
      viewProfileDesc: 'Voir les informations de votre profil',
    },
  },
  de: {
    common: {
      search: 'Dateien suchen...',
      upload: 'Hochladen',
      sort: 'Sortieren nach',
      nameAsc: 'Name (A-Z)',
      nameDesc: 'Name (Z-A)',
      newest: 'Neueste zuerst',
      oldest: 'Älteste zuerst',
      sizeDesc: 'Größe (groß nach klein)',
      sizeAsc: 'Größe (klein nach groß)',
      cancel: 'Abbrechen',
      back: 'Zurück zum Dashboard',
    },
    notifications: {
      title: 'Benachrichtigungen',
      markAllRead: 'Alle als gelesen markieren',
      fileUploaded: 'Datei hochgeladen',
      fileShared: 'Datei geteilt',
      fileStarred: 'Datei mit Stern markiert',
      viewAll: 'Alle Benachrichtigungen anzeigen',
    },
    help: {
      title: 'Hilfe & Support',
      userGuide: 'Benutzerhandbuch',
      userGuideDesc: 'Erfahren Sie, wie Sie das Speichersystem verwenden',
      faq: 'FAQ',
      faqDesc: 'Häufig gestellte Fragen',
      contact: 'Support kontaktieren',
      contactDesc: 'Erhalten Sie Hilfe von unserem Team',
      report: 'Problem melden',
      reportDesc: 'Lassen Sie uns wissen, wenn etwas nicht funktioniert',
    },
    profile: {
      title: 'Mein Konto',
      viewProfile: 'Profil anzeigen',
      viewProfileDesc: 'Sehen Sie Ihre Profilinformationen',
    },
  },
  zh: {
    common: {
      search: '搜索文件...',
      upload: '上传',
      sort: '排序方式',
      nameAsc: '名称 (A-Z)',
      nameDesc: '名称 (Z-A)',
      newest: '最新优先',
      oldest: '最早优先',
      sizeDesc: '大小 (大至小)',
      sizeAsc: '大小 (小至大)',
      cancel: '取消',
      back: '返回仪表板',
    },
    notifications: {
      title: '通知',
      markAllRead: '全部标记为已读',
      fileUploaded: '文件已上传',
      fileShared: '文件已共享',
      fileStarred: '文件已加星标',
      viewAll: '查看所有通知',
    },
    help: {
      title: '帮助与支持',
      userGuide: '用户指南',
      userGuideDesc: '了解如何使用存储系统',
      faq: '常见问题',
      faqDesc: '常见问题解答',
      contact: '联系支持',
      contactDesc: '获取我们团队的帮助',
      report: '报告问题',
      reportDesc: '让我们知道是否有问题',
    },
    profile: {
      title: '我的账户',
      viewProfile: '查看个人资料',
      viewProfileDesc: '查看您的个人资料信息',
    },
  },
};

// Language context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Get saved language from localStorage or default to English
    const savedLang = localStorage.getItem('language') as Language;
    return savedLang && ['en', 'es', 'fr', 'de', 'zh'].includes(savedLang) ? savedLang : 'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 