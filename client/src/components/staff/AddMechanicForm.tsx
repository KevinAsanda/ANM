import React, { useState } from 'react';
import { staffService } from '../../services/staffService.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AddMechanicFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddMechanicForm: React.FC<AddMechanicFormProps> = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await staffService.createMechanic({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password
      });

      setSuccessMsg('Mechanic account created successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Error creating mechanic account:', err);
      if (err.message?.includes('already exists') || err.message?.includes('registered')) {
        setError('An account with this email already exists.');
      } else {
        setError(err.message || 'Failed to create mechanic account.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle size={16} className="text-green-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <Input
        label="Full Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Thabo Cele"
        disabled={isSubmitting}
        required
      />

      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="e.g. thabo@anm.co.za"
        disabled={isSubmitting}
        required
      />

      <Input
        label="Temporary Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Minimum 8 characters"
        disabled={isSubmitting}
        required
      />

      <div className="flex justify-end gap-3 border-t border-border pt-4 mt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
        >
          Create Account
        </Button>
      </div>
    </form>
  );
};

export default AddMechanicForm;
