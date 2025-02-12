import React, { useState } from 'react';
import Layout from './Layout';
import { Search, Plus, Edit2, Trash2, Download } from 'lucide-react';
import { useCampStore } from '../store/campStore';
import { useAuthStore } from '../store/authStore';
import { useTrackingStore } from '../store/trackingStore';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import { Camper } from '../types';
import * as XLSX from 'xlsx';

interface CamperFormData {
  fullName: string;
  institution: string;
  leader: string;
  birthDate: string;
  age: number;
  gender: 'M' | 'F';
  phone: string;
  address: string;
  department: string;
  guardianName?: string;
  guardianPhone?: string;
}

interface BulkDeleteConfirm {
  type: 'all' | 'leader' | 'institution';
  value?: string;
}

export default function Campers() {
  const { isAdmin } = useAuthStore();
  const { campers, leaders, addCamper, updateCamper, deleteCamper, bulkDeleteCampers } = useCampStore();
  const { deleteEntriesForCamper, deleteAllEntries, deleteEntriesByLeader, deleteEntriesByInstitution } = useTrackingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState<BulkDeleteConfirm | null>(null);
  const [editingCamper, setEditingCamper] = useState<Camper | null>(null);
  const [formData, setFormData] = useState<CamperFormData>({
    fullName: '',
    institution: '',
    leader: leaders[0]?.name || '',
    birthDate: '',
    age: 0,
    gender: 'M',
    phone: '',
    address: '',
    department: '',
  });

  const calculateAge = (day: string, month: string, year: string) => {
    if (!day || !month || !year) return 0;
    const today = new Date();
    const birth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleBirthDateChange = (type: 'day' | 'month' | 'year', value: string) => {
    const currentDate = formData.birthDate.split('/');
    let day = currentDate[0] || '';
    let month = currentDate[1] || '';
    let year = currentDate[2] || '';

    switch (type) {
      case 'day':
        day = value.padStart(2, '0');
        break;
      case 'month':
        month = value.padStart(2, '0');
        break;
      case 'year':
        year = value;
        break;
    }

    const newBirthDate = `${day}/${month}/${year}`;
    const newAge = calculateAge(day, month, year);

    setFormData(prev => ({
      ...prev,
      birthDate: newBirthDate,
      age: newAge
    }));
  };

  const exportToExcel = () => {
    const data = campers.map(camper => ({
      'Número': camper.sequentialNumber,
      'Nombre Completo': camper.fullName,
      'Institución': camper.institution,
      'Líder': camper.leader,
      'Edad': camper.age,
      'Género': camper.gender,
      'Teléfono': camper.phone,
      'Dirección': camper.address,
      'Departamento': camper.department,
      'Tutor': camper.guardianName,
      'Teléfono Tutor': camper.guardianPhone
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Campistas');
    XLSX.writeFile(wb, 'campistas.xlsx');
  };

  const handleBulkDelete = (type: 'all' | 'leader' | 'institution', value?: string) => {
    setBulkDeleteConfirm({ type, value });
  };

  const confirmBulkDelete = () => {
    if (!bulkDeleteConfirm) return;
    
    switch (bulkDeleteConfirm.type) {
      case 'all':
        bulkDeleteCampers();
        deleteAllEntries();
        break;
      case 'leader':
        if (!bulkDeleteConfirm.value) {
          alert('Por favor seleccione un líder');
          return;
        }
        bulkDeleteCampers('leader', bulkDeleteConfirm.value);
        deleteEntriesByLeader(bulkDeleteConfirm.value);
        break;
      case 'institution':
        if (!bulkDeleteConfirm.value) {
          alert('Por favor seleccione una institución');
          return;
        }
        bulkDeleteCampers('institution', bulkDeleteConfirm.value);
        deleteEntriesByInstitution(bulkDeleteConfirm.value);
        break;
    }
    
    setBulkDeleteConfirm(null);
  };

  const filteredCampers = campers.filter(camper => 
    camper.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    camper.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    camper.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
    camper.sequentialNumber.toString().includes(searchTerm)
  );

  const handleAdd = () => {
    setFormData({
      fullName: '',
      institution: '',
      leader: leaders[0]?.name || '',
      birthDate: '',
      age: 0,
      gender: 'M',
      phone: '',
      address: '',
      department: '',
      guardianName: '',
      guardianPhone: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (camper: Camper) => {
    setEditingCamper(camper);
    setFormData({
      fullName: camper.fullName,
      institution: camper.institution,
      leader: camper.leader,
      birthDate: camper.birthDate || '',
      age: camper.age,
      gender: camper.gender,
      phone: camper.phone || '',
      address: camper.address || '',
      department: camper.department || '',
      guardianName: camper.guardianName || '',
      guardianPhone: camper.guardianPhone || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm !== null) {
      deleteCamper(deleteConfirm);
      deleteEntriesForCamper(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.age < 0 || formData.age > 120) {
      alert('Por favor ingrese una edad válida');
      return;
    }

    if (formData.age < 18 && (!formData.guardianName || !formData.guardianPhone)) {
      alert('La información del tutor es obligatoria para menores de edad');
      return;
    }

    if (isAddModalOpen) {
      addCamper(formData);
      setIsAddModalOpen(false);
    } else if (isEditModalOpen && editingCamper) {
      updateCamper(editingCamper.id, formData);
      setIsEditModalOpen(false);
      setEditingCamper(null);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre Completo
        </label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Institución/Iglesia
        </label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.institution}
          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Líder
        </label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.leader}
          onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
        >
          {leaders.map((leader) => (
            <option key={leader.name} value={leader.name}>
              {leader.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Fecha de Nacimiento
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <input
              type="number"
              required
              min="1"
              max="31"
              placeholder="Día"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.birthDate.split('/')[0] || ''}
              onChange={(e) => handleBirthDateChange('day', e.target.value)}
            />
          </div>
          <div>
            <input
              type="number"
              required
              min="1"
              max="12"
              placeholder="Mes"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.birthDate.split('/')[1] || ''}
              onChange={(e) => handleBirthDateChange('month', e.target.value)}
            />
          </div>
          <div>
            <input
              type="number"
              required
              min="1900"
              max={new Date().getFullYear()}
              placeholder="Año"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.birthDate.split('/')[2] || ''}
              onChange={(e) => handleBirthDateChange('year', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Edad
        </label>
        <input
          type="number"
          required
          readOnly
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
          value={formData.age}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Género
        </label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
        >
          <option value="M">M</option>
          <option value="F">F</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <input
          type="tel"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Dirección
        </label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Departamento
        </label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
        />
      </div>

      {(formData.age < 18 || formData.guardianName || formData.guardianPhone) && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Tutor
              {formData.age < 18 && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              required={formData.age < 18}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.guardianName}
              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono del Tutor
              {formData.age < 18 && <span className="text-red-500">*</span>}
            </label>
            <input
              type="tel"
              required={formData.age < 18}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.guardianPhone}
              onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
            />
          </div>
        </>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {isAddModalOpen ? 'Agregar' : 'Guardar'}
        </button>
      </div>
    </form>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Campistas</h1>
          <div className="flex gap-4">
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Campista
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={exportToExcel}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Exportar a Excel
                </button>
                <button
                  onClick={() => setBulkDeleteConfirm({ type: 'all' })}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Eliminar
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, líder, institución o número..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Completo
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Institución/Iglesia
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Líder
                    </th>
                    {isAdmin && (
                      <>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Edad
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Género
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teléfono
                        </th>
                      </>
                    )}
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCampers.map((camper) => (
                    <tr key={camper.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {camper.sequentialNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {camper.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {camper.institution}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {camper.leader}
                      </td>
                      {isAdmin && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {camper.age}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {camper.gender}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {camper.phone}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(camper)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(camper.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar Nuevo Campista"
      >
        {renderForm()}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCamper(null);
        }}
        title="Editar Campista"
      >
        {renderForm()}
      </Modal>

      <Modal
        isOpen={bulkDeleteConfirm !== null}
        onClose={() => setBulkDeleteConfirm(null)}
        title="Eliminar Campistas"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setBulkDeleteConfirm({ type: 'all' })}
              className={`w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 ${
                bulkDeleteConfirm?.type === 'all' ? 'bg-gray-100' : ''
              }`}
            >
              Eliminar todos los campistas
            </button>
            <button
              onClick={() => setBulkDeleteConfirm({ type: 'leader' })}
              className={`w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 ${
                bulkDeleteConfirm?.type === 'leader' ? 'bg-gray-100' : ''
              }`}
            >
              Eliminar por líder
            </button>
            <button
              onClick={() => setBulkDeleteConfirm({ type: 'institution' })}
              className={`w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 ${
                bulkDeleteConfirm?.type === 'institution' ? 'bg-gray-100' : ''
              }`}
            >
              Eliminar por institución
            </button>
          </div>

          {(bulkDeleteConfirm?.type === 'leader' || bulkDeleteConfirm?.type === 'institution') && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccione {bulkDeleteConfirm.type === 'leader' ? 'un líder' : 'una institución'}
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={bulkDeleteConfirm.value || ''}
                onChange={(e) => setBulkDeleteConfirm({ ...bulkDeleteConfirm, value: e.target.value })}
              >
                <option value="">Seleccione {bulkDeleteConfirm.type === 'leader' ? 'un líder' : 'una institución'}</option>
                {bulkDeleteConfirm.type === 'leader'
                  ? leaders.map(leader => (
                      <option key={leader.name} value={leader.name}>{leader.name}</option>
                    ))
                  : [...new Set(campers.map(c => c.institution))].map(institution => (
                      <option key={institution} value={institution}>{institution}</option>
                    ))
                }
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => setBulkDeleteConfirm(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              onClick={confirmBulkDelete}
              disabled={
                (bulkDeleteConfirm?.type === 'leader' || bulkDeleteConfirm?.type === 'institution') &&
                !bulkDeleteConfirm.value
              }
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este campista? Esta acción no se puede deshacer."
      />
    </Layout>
  );
}