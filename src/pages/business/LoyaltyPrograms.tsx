import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LoyaltyProgram } from '../../types';
import DetailedLoyalty from '../../components/loyalty2/DetailedLoyalty';
import SimpleLoyalty from '../../components/loyalty2/SimpleLoyalty';
import LoyaltyInviteMemberModal from '../../components/loyalty2/LoyaltyInviteMemberModal';
import LoyaltyScanModal from '../../components/loyalty2/LoyaltyScanModal';
import LoyaltyRewardModal from '../../components/loyalty2/LoyaltyRewardModal';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { useViewToggle } from '../../hooks/useViewToggle';

const LoyaltyProgramPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const { view } = useViewToggle();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProgram = async () => {
      if (!programId) return;
      
      try {
        const programRef = doc(db, 'loyaltyPrograms', programId);
        const programSnap = await getDoc(programRef);
        if (programSnap.exists()) {
          setProgram({ id: programSnap.id, ...programSnap.data() } as LoyaltyProgram);
        }
      } catch (error) {
        console.error('Error fetching loyalty program:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]);

  const handleProgramUpdated = async () => {
    if (!programId) return;
    
    try {
      const programRef = doc(db, 'loyaltyPrograms', programId);
      const programSnap = await getDoc(programRef);
      
      if (programSnap.exists()) {
        setProgram({ id: programSnap.id, ...programSnap.data() } as LoyaltyProgram);
      }
    } catch (error) {
      console.error('Error refreshing loyalty program:', error);
    }
  };

  const handleBackClick = () => {
    navigate('/business/dashboard');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!program) {
    return <div className="p-6">Loyalty program not found</div>;
  }

  return (
    <div className="container mx-auto">
      {view === 'detailed' ? (
        <DetailedLoyalty 
          loyaltyProgram={program}
          loyaltyRewards={[]}
          businessId={program.businessId || ''}
          onProgramSaved={() => {}}
          onRewardsChange={() => {}}
          showCelebration={false}
          onBackClick={handleBackClick}
        />
      ) : (
        <SimpleLoyalty 
          program={program}
          onInviteMember={() => setShowInviteModal(true)}
          onScanQR={() => setShowScanModal(true)}
          onReward={() => setShowRewardModal(true)}
          onBackClick={handleBackClick}
        />
      )}
      
      {showInviteModal && (
        <LoyaltyInviteMemberModal 
          program={program}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            handleProgramUpdated();
          }}
        />
      )}
      
      {showScanModal && (
        <LoyaltyScanModal 
          program={program}
          onClose={() => setShowScanModal(false)}
          onSuccess={() => {
            setShowScanModal(false);
            handleProgramUpdated();
          }}
        />
      )}
      
      {showRewardModal && (
        <LoyaltyRewardModal 
          program={program}
          onClose={() => setShowRewardModal(false)}
          onSuccess={() => {
            setShowRewardModal(false);
            handleProgramUpdated();
          }}
        />
      )}
    </div>
  );
};

export default LoyaltyProgramPage;