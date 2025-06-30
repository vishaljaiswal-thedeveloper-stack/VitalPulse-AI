import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ArogyaBot from './ArogyaBot';

function Footer() {
  const { t } = useTranslation();
  const [isBotMinimized, setIsBotMinimized] = useState(true);

  const toggleBot = () => {
    setIsBotMinimized(!isBotMinimized);
  };

  return (
    <>
      {/* ArogyaBot Component */}
      <ArogyaBot 
        isMinimized={isBotMinimized} 
        onToggle={toggleBot}
      />
      
      {/* Traditional Footer (optional) */}
      <footer style={{
        background: 'linear-gradient(135deg, #FF9933 0%, #138808 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '2rem 1rem',
        marginTop: '4rem',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '1rem' }}>🏥 VitalPulse</h3>
          <p style={{ opacity: 0.9, marginBottom: '1rem' }}>
            {t('subtitle')}
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            © 2024 VitalPulse. All rights reserved. | Built with ❤️ for Rural India
          </p>
        </div>
      </footer>
    </>
  );
}

export default Footer;