import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Mail, User, Lock, Shield } from 'lucide-react';
import { authAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import CustomSelect from '../../components/CustomSelect';

const UserModal = ({ user, onClose, onSuccess }) => {
  const isEdit = !!user;
  const { register, handleSubmit, formState: { errors }, watch, control } = useForm({
    defaultValues: user ? {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    } : {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'viewer',
      isActive: true
    }
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        // Update user - you'll need to implement this endpoint
        await authAPI.updateUser(user._id, {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          isActive: data.isActive
        });
        toast.success('User updated successfully');
      } else {
        // Create user
        await authAPI.register({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          role: data.role
        });
        toast.success('User created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-container">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit User' : 'Create New User'}</h2>
          <button onClick={onClose} className="btn-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-content">
          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                <User size={16} />
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="form-control"
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                <User size={16} />
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="form-control"
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          {!isEdit && (
            <>
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <Lock size={16} />
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                {errors.password && <span className="form-error">{errors.password.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  <Lock size={16} />
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                />
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
              </div>
            </>
          )}

          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="role" className="form-label">
                <Shield size={16} />
                Role
              </label>
              <Controller
                name="role"
                control={control}
                defaultValue="viewer"
                rules={{ required: 'Role is required' }}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: 'viewer', label: 'Viewer' },
                      { value: 'editor', label: 'Editor' },
                      { value: 'admin', label: 'Admin' }
                    ]}
                    placeholder="Select role"
                    error={!!errors.role}
                  />
                )}
              />
              {errors.role && <span className="form-error">{errors.role.message}</span>}
              <div className="form-help-text">
                <strong>Admin:</strong> Full access to all features<br />
                <strong>Editor:</strong> Can create and edit content<br />
                <strong>Viewer:</strong> Read-only access
              </div>
            </div>

            {isEdit && (
              <div className="form-group">
                <label htmlFor="isActive" className="form-label">
                  Status
                </label>
                <div className="checkbox-wrapper">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                    />
                    <span>Account Active</span>
                  </label>
                  <div className="form-help-text">
                    Inactive users cannot log in
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UserModal;
