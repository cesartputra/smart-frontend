// src/components/forms/LocationSelector.jsx - FIXED INFINITE LOOP VERSION
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import locationService from '../../services/locationService';

const LocationSelector = ({ onLocationChange, error }) => {
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedKecamatan, setSelectedKecamatan] = useState('');
    const [selectedKelurahan, setSelectedKelurahan] = useState('');
    const [selectedRW, setSelectedRW] = useState('');
    const [selectedRT, setSelectedRT] = useState('');

    // ✅ FIXED: Memoized callback to prevent infinite re-renders
    const handleLocationChange = useCallback((locationData) => {
        if (onLocationChange && typeof onLocationChange === 'function') {
            onLocationChange(locationData);
        }
    }, [onLocationChange]);

    // FIXED: Improved error handling and data processing
    const provincesQuery = useQuery({
        queryKey: ['provinces'],
        queryFn: locationService.getProvinces,
        retry: 3,
        retryDelay: 1000,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        onError: (error) => {
            console.error('❌ Provinces query error:', error);
        }
    });

    const citiesQuery = useQuery({
        queryKey: ['cities', selectedProvince],
        queryFn: () => locationService.getCities(selectedProvince),
        enabled: !!selectedProvince && selectedProvince !== '',
        retry: 2,
        staleTime: 5 * 60 * 1000,
        onError: (error) => {
            console.error('❌ Cities query error:', error);
        }
    });

    const kecamatanQuery = useQuery({
        queryKey: ['kecamatan', selectedCity],
        queryFn: () => locationService.getKecamatan(selectedCity),
        enabled: !!selectedCity && selectedCity !== '',
        retry: 2,
        staleTime: 5 * 60 * 1000,
        onError: (error) => {
            console.error('❌ Kecamatan query error:', error);
        }
    });

    const kelurahanQuery = useQuery({
        queryKey: ['kelurahan', selectedKecamatan],
        queryFn: () => locationService.getKelurahan(selectedKecamatan),
        enabled: !!selectedKecamatan && selectedKecamatan !== '',
        retry: 2,
        staleTime: 5 * 60 * 1000,
        onError: (error) => {
            console.error('❌ Kelurahan query error:', error);
        }
    });

    const rwQuery = useQuery({
        queryKey: ['rw', selectedKelurahan],
        queryFn: () => locationService.getRW(selectedKelurahan),
        enabled: !!selectedKelurahan && selectedKelurahan !== '',
        retry: 2,
        staleTime: 5 * 60 * 1000,
        onError: (error) => {
            console.error('❌ RW query error:', error);
        }
    });

    const rtQuery = useQuery({
        queryKey: ['rt', selectedRW],
        queryFn: () => locationService.getRT(selectedRW),
        enabled: !!selectedRW && selectedRW !== '',
        retry: 2,
        staleTime: 5 * 60 * 1000,
        onError: (error) => {
            console.error('❌ RT query error:', error);
        }
    });

    // ✅ FIXED: Optimized reset effects with proper dependency arrays
    useEffect(() => {
        if (selectedProvince) {
            setSelectedCity('');
            setSelectedKecamatan('');
            setSelectedKelurahan('');
            setSelectedRW('');
            setSelectedRT('');
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedCity) {
            setSelectedKecamatan('');
            setSelectedKelurahan('');
            setSelectedRW('');
            setSelectedRT('');
        }
    }, [selectedCity]);

    useEffect(() => {
        if (selectedKecamatan) {
            setSelectedKelurahan('');
            setSelectedRW('');
            setSelectedRT('');
        }
    }, [selectedKecamatan]);

    useEffect(() => {
        if (selectedKelurahan) {
            setSelectedRW('');
            setSelectedRT('');
        }
    }, [selectedKelurahan]);

    useEffect(() => {
        if (selectedRW) {
            setSelectedRT('');
        }
    }, [selectedRW]);

    // ✅ FIXED: Only call parent when RT is selected and all required fields are present
    useEffect(() => {
        if (selectedRT && selectedProvince && selectedCity && selectedKecamatan && selectedKelurahan && selectedRW) {
            const locationData = {
                province_id: parseInt(selectedProvince),
                city_id: parseInt(selectedCity),
                kecamatan_id: parseInt(selectedKecamatan),
                kelurahan_id: parseInt(selectedKelurahan),
                rw_id: parseInt(selectedRW),
                rt_id: parseInt(selectedRT),
            };
            
            console.log('📍 Location data ready:', locationData);
            handleLocationChange(locationData);
        } else {
            // Clear location data when incomplete
            handleLocationChange({});
        }
    }, [selectedProvince, selectedCity, selectedKecamatan, selectedKelurahan, selectedRW, selectedRT, handleLocationChange]);

    // FIXED: More robust data handling
    const safeGetData = useCallback((queryData, isLoading, isError) => {
        if (isLoading || isError || !queryData) return [];
        if (Array.isArray(queryData)) return queryData;
        if (queryData.data && Array.isArray(queryData.data)) return queryData.data;
        return [];
    }, []);

    // FIXED: Better loading state detection
    const isAnyLoading = provincesQuery.isFetching || citiesQuery.isFetching || 
                       kecamatanQuery.isFetching || kelurahanQuery.isFetching || 
                       rwQuery.isFetching || rtQuery.isFetching;

    // ✅ FIXED: Memoized handlers to prevent unnecessary re-renders
    const handleProvinceChange = useCallback((e) => {
        const value = e.target.value;
        console.log('🏛️ Province selected:', value);
        setSelectedProvince(value);
    }, []);

    const handleCityChange = useCallback((e) => {
        const value = e.target.value;
        console.log('🏙️ City selected:', value);
        setSelectedCity(value);
    }, []);

    const handleKecamatanChange = useCallback((e) => {
        const value = e.target.value;
        console.log('🏘️ Kecamatan selected:', value);
        setSelectedKecamatan(value);
    }, []);

    const handleKelurahanChange = useCallback((e) => {
        const value = e.target.value;
        console.log('🏡 Kelurahan selected:', value);
        setSelectedKelurahan(value);
    }, []);

    const handleRWChange = useCallback((e) => {
        const value = e.target.value;
        console.log('🏠 RW selected:', value);
        setSelectedRW(value);
    }, []);

    const handleRTChange = useCallback((e) => {
        const value = e.target.value;
        console.log('🏘️ RT selected:', value);
        setSelectedRT(value);
    }, []);

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi Tempat Tinggal <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-4">
                    Pilih lokasi sesuai dengan alamat KTP Anda
                </p>
            </div>

            {/* Enhanced error display */}
            {provincesQuery.isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">
                        Gagal memuat data lokasi. Silakan refresh halaman atau coba lagi.
                    </p>
                    <p className="text-red-600 text-xs mt-1">
                        Error: {provincesQuery.error?.message || 'Unknown error'}
                    </p>
                </div>
            )}

            {/* Province & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Province */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provinsi
                    </label>
                    <select
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={provincesQuery.isLoading || provincesQuery.isError}
                    >
                        <option value="">
                            {provincesQuery.isLoading ? 'Memuat provinsi...' : 
                             provincesQuery.isError ? 'Error memuat data' : 
                             'Pilih Provinsi'}
                        </option>
                        {safeGetData(provincesQuery.data, provincesQuery.isLoading, provincesQuery.isError).map((province) => (
                            <option key={province.id} value={province.id}>
                                {province.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* City */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kota/Kabupaten
                    </label>
                    <select
                        value={selectedCity}
                        onChange={handleCityChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!selectedProvince || citiesQuery.isLoading || citiesQuery.isError}
                    >
                        <option value="">
                            {citiesQuery.isLoading ? 'Memuat kota...' : 
                             citiesQuery.isError ? 'Error memuat data' :
                             !selectedProvince ? 'Pilih provinsi dulu' :
                             'Pilih Kota/Kabupaten'}
                        </option>
                        {safeGetData(citiesQuery.data, citiesQuery.isLoading, citiesQuery.isError).map((city) => (
                            <option key={city.id} value={city.id}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Kecamatan & Kelurahan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kecamatan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kecamatan
                    </label>
                    <select
                        value={selectedKecamatan}
                        onChange={handleKecamatanChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!selectedCity || kecamatanQuery.isLoading || kecamatanQuery.isError}
                    >
                        <option value="">
                            {kecamatanQuery.isLoading ? 'Memuat kecamatan...' : 
                             kecamatanQuery.isError ? 'Error memuat data' :
                             !selectedCity ? 'Pilih kota dulu' :
                             'Pilih Kecamatan'}
                        </option>
                        {safeGetData(kecamatanQuery.data, kecamatanQuery.isLoading, kecamatanQuery.isError).map((kecamatan) => (
                            <option key={kecamatan.id} value={kecamatan.id}>
                                {kecamatan.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Kelurahan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kelurahan/Desa
                    </label>
                    <select
                        value={selectedKelurahan}
                        onChange={handleKelurahanChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!selectedKecamatan || kelurahanQuery.isLoading || kelurahanQuery.isError}
                    >
                        <option value="">
                            {kelurahanQuery.isLoading ? 'Memuat kelurahan...' : 
                             kelurahanQuery.isError ? 'Error memuat data' :
                             !selectedKecamatan ? 'Pilih kecamatan dulu' :
                             'Pilih Kelurahan/Desa'}
                        </option>
                        {safeGetData(kelurahanQuery.data, kelurahanQuery.isLoading, kelurahanQuery.isError).map((kelurahan) => (
                            <option key={kelurahan.id} value={kelurahan.id}>
                                {kelurahan.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* RW & RT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RW */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        RW
                    </label>
                    <select
                        value={selectedRW}
                        onChange={handleRWChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!selectedKelurahan || rwQuery.isLoading || rwQuery.isError}
                    >
                        <option value="">
                            {rwQuery.isLoading ? 'Memuat RW...' : 
                             rwQuery.isError ? 'Error memuat data' :
                             !selectedKelurahan ? 'Pilih kelurahan dulu' :
                             'Pilih RW'}
                        </option>
                        {safeGetData(rwQuery.data, rwQuery.isLoading, rwQuery.isError).map((rw) => (
                            <option key={rw.id} value={rw.id}>
                                RW {rw.no ? rw.no.toString().padStart(3, '0') : 'N/A'}
                            </option>
                        ))}
                    </select>
                </div>

                {/* RT */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        RT <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={selectedRT}
                        onChange={handleRTChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            error ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={!selectedRW || rtQuery.isLoading || rtQuery.isError}
                    >
                        <option value="">
                            {rtQuery.isLoading ? 'Memuat RT...' : 
                             rtQuery.isError ? 'Error memuat data' :
                             !selectedRW ? 'Pilih RW dulu' :
                             'Pilih RT'}
                        </option>
                        {safeGetData(rtQuery.data, rtQuery.isLoading, rtQuery.isError).map((rt) => (
                            <option key={rt.id} value={rt.id}>
                                RT {rt.no ? rt.no.toString().padStart(3, '0') : 'N/A'}
                            </option>
                        ))}
                    </select>
                    {error && (
                        <p className="mt-1 text-sm text-red-600">{error.message}</p>
                    )}
                </div>
            </div>

            {/* Enhanced Loading States */}
            {isAnyLoading && (
                <div className="text-center py-2">
                    <div className="inline-flex items-center text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Memuat data lokasi...
                    </div>
                </div>
            )}

            {/* Progress indicator */}
            <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📍</span>
                    <span>
                        {selectedProvince && 'Provinsi ✓ '} 
                        {selectedCity && 'Kota ✓ '}
                        {selectedKecamatan && 'Kecamatan ✓ '}
                        {selectedKelurahan && 'Kelurahan ✓ '}
                        {selectedRW && 'RW ✓ '}
                        {selectedRT && 'RT ✓'}
                    </span>
                </div>
            </div>

            {/* Debug information in development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-100 p-2 rounded text-xs text-gray-600">
                    <details>
                        <summary>Debug Info (Development)</summary>
                        <pre className="mt-2 text-xs">
                            {JSON.stringify({
                                selected: {
                                    province: selectedProvince,
                                    city: selectedCity,
                                    kecamatan: selectedKecamatan,
                                    kelurahan: selectedKelurahan,
                                    rw: selectedRW,
                                    rt: selectedRT
                                },
                                dataCount: {
                                    provinces: safeGetData(provincesQuery.data, provincesQuery.isLoading, provincesQuery.isError).length,
                                    cities: safeGetData(citiesQuery.data, citiesQuery.isLoading, citiesQuery.isError).length,
                                    kecamatan: safeGetData(kecamatanQuery.data, kecamatanQuery.isLoading, kecamatanQuery.isError).length,
                                    kelurahan: safeGetData(kelurahanQuery.data, kelurahanQuery.isLoading, kelurahanQuery.isError).length,
                                    rw: safeGetData(rwQuery.data, rwQuery.isLoading, rwQuery.isError).length,
                                    rt: safeGetData(rtQuery.data, rtQuery.isLoading, rtQuery.isError).length
                                },
                                isLoading: isAnyLoading,
                                errors: {
                                    provinces: provincesQuery.isError,
                                    cities: citiesQuery.isError,
                                    kecamatan: kecamatanQuery.isError,
                                    kelurahan: kelurahanQuery.isError,
                                    rw: rwQuery.isError,
                                    rt: rtQuery.isError
                                }
                            }, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
};

export default LocationSelector;