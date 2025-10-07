'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      if (json.data) {
        setUsers(json.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let avatarUrl = '';

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadJson = await uploadRes.json();
        
        if (uploadJson.error) {
          throw new Error(uploadJson.error);
        }
        avatarUrl = uploadJson.url;
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, avatar_url: avatarUrl }),
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setMessage('User added successfully!');
      setName('');
      setEmail('');
      setFile(null);
      fetchUsers();
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                User Management
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Add and manage users with profile pictures
              </p>
            </div>

            {/* Add User Form */}
            <div className="border-b border-gray-900/10 pb-12">
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Profile Information
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                This information will be displayed in the users list.
              </p>

              <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  {/* Name Input */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Full name
                    </label>
                    <div className="mt-2">
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-gray-300 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Email address
                    </label>
                    <div className="mt-2">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline  -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="col-span-full">
                    <label
                      htmlFor="photo"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Photo
                    </label>
                    <div className="mt-2 flex items-center gap-x-3">
                      {file ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded-full">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-12 w-12 text-gray-300"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <label
                        htmlFor="file-input"
                        className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        {file ? 'Change' : 'Upload'}
                        <input
                          id="file-input"
                          type="file"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          accept="image/*"
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {message && (
                  <div
                    className={`rounded-md p-4 ${
                      message.includes('success')
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    <p className="text-sm font-medium">{message}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <button
                    type="button"
                    onClick={() => {
                      setName('');
                      setEmail('');
                      setFile(null);
                      setMessage('');
                    }}
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>

            {/* Users List */}
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Users
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                A list of all users including their name, email and profile picture.
              </p>
              
              <ul role="list" className="divide-y divide-gray-100 mt-6">
                {users.length > 0 ? (
                  users.map((user) => (
                    <li key={user.id} className="flex justify-between gap-x-6 py-5">
                      <div className="flex min-w-0 gap-x-4">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={user.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 flex-none rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0 flex-auto">
                          <p className="text-sm font-semibold leading-6 text-gray-900">
                            {user.name}
                          </p>
                          <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                        <div className="mt-1 flex items-center gap-x-1.5">
                          <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                          </div>
                          <p className="text-xs leading-5 text-gray-500">Active</p>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-8 text-center text-sm text-gray-500">
                    No users found. Add your first user above.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}