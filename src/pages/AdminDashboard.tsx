onChange={e => setLocalSettings({...localSettings, namaSekolah: e.target.value})}

                        className={cn("block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors", 

                          isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"

                        )}

                      />

                    </div>

                    <div>

                      <label className={cn("block text-sm font-medium mb-1", isDarkMode ? "text-slate-300" : "text-slate-700")}>Tanggal Cutoff Perhitungan Usia</label>

                      <input

                        type="date"

                        value={localSettings.tanggalCutoffUsia || ''}

                        onChange={e => setLocalSettings({...localSettings, tanggalCutoffUsia: e.target.value})}

                        className={cn("block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors", 

                          isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"

                        )}

                      />

                    </div>

                  </div>

                )}



                {settingsTab === 'form' && (

                  <div className="space-y-4">

                    <h3 className="text-lg font-medium">Kustomisasi Field Formulir</h3>

                    <p className={cn("text-xs", isDarkMode ? "text-slate-400" : "text-slate-500")}>Aktifkan atau nonaktifkan field yang muncul pada formulir pendaftaran siswa baru.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {localSettings.formFields?.map((field: any, index: number) => (

                        <div key={field.id || index} className={cn("flex items-center justify-between p-3 border rounded-lg", isDarkMode ? "border-slate-700 bg-slate-900/50" : "border-slate-200 bg-slate-50")}>

                          <div>

                            <p className="text-sm font-medium">{field.label}</p>

                            <p className={cn("text-xs opacity-70")}>Tipe: {field.type}</p>

                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">

                            <input 

                              type="checkbox" 

                              checked={field.required} 

                              onChange={(e) => {

                                const updatedFields = [...(localSettings.formFields || [])];

                                updatedFields[index] = { ...field, required: e.target.checked };

                                setLocalSettings({ ...localSettings, formFields: updatedFields });

                              }}

                              className="sr-only peer" 

                            />

                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>

                          </label>

                        </div>

                      ))}

                    </div>

                  </div>

                )}



                {settingsTab === 'surat' && (

                  <div className="space-y-4">

                    <div>

                      <label className={cn("block text-sm font-medium mb-1", isDarkMode ? "text-slate-300" : "text-slate-700")}>Kop Surat / Header PDF</label>

                      <input

                        type="text"

                        value={localSettings.kopSurat || ''}

                        onChange={e => setLocalSettings({...localSettings, kopSurat: e.target.value})}

                        placeholder="Contoh: DINAS PENDIDIKAN DAN KEBUDAYAAN..."

                        className={cn("block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors", 

                          isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"

                        )}

                      />

                    </div>

                  </div>

                )}



                {settingsTab === 'daftar-ulang' && (

                  <div className="space-y-4">

                    <div>

                      <label className={cn("block text-sm font-medium mb-1", isDarkMode ? "text-slate-300" : "text-slate-700")}>Instruksi atau Syarat Daftar Ulang</label>

                      <textarea

                        rows={4}

                        value={localSettings.syaratDaftarUlang || ''}

                        onChange={e => setLocalSettings({...localSettings, syaratDaftarUlang: e.target.value})}

                        placeholder="Tuliskan berkas apa saja yang harus dibawa saat daftar ulang fisik..."

                        className={cn("block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors", 

                          isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"

                        )}

                      />

                    </div>

                  </div>

                )}



                {settingsTab === 'kepala-sekolah' && (

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>

                      <label className={cn("block text-sm font-medium mb-1", isDarkMode ? "text-slate-300" : "text-slate-700")}>Nama Kepala Sekolah</label>

                      <input

                        type="text"

                        value={localSettings.namaKepalaSekolah || ''}

                        onChange={e => setLocalSettings({...localSettings, namaKepalaSekolah: e.target.value})}

                        className={cn("block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors", 

                          isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"

                        )}

                      />

                    </div>

                    <div>

                      <label className={cn("block text-sm font-medium mb-1", isDarkMode ? "text-slate-300" : "text-slate-700")}>NIP Kepala Sekolah</label>

                      <input

                        type="text"

                        value={localSettings.nipKepalaSekolah || ''}

                        onChange={e => setLocalSettings({...localSettings, nipKepalaSekolah: e.target.value})}

                        className={cn("block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors", 

                          isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"

                        )}

                      />

                    </div>

                  </div>

                )}



                {settingsTab === 'panduan' && (

                  <div>

                    <label className={cn("block text-sm font-medium mb-1", isDarkMode ? "text-slate-300" : "text-slate-700")}>Panduan Alur Pendaftaran</label>

                    <textarea

                      rows={6}

                      value={localSettings.panduanPendaftaran || ''}

                      onChange={e => setLocalSettings({...localSettings, panduanPendaftaran: e.target.value})}

                      placeholder="Langkah 1: Isi formulir... Langkah 2: Tunggu verifikasi berkas..."

                      className={cn("block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors", 

                        isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"

                      )}

                    />

                  </div>

                )}



                {/* Submit Settings Button */}

                <div className="flex justify-end pt-4 border-t dark:border-slate-700">

                  <button

                    onClick={handleSaveSettings}

                    disabled={isSavingSettings}

                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70"

                  >

                    {isSavingSettings ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} 

                    Simpan Perubahan

                  </button>

                </div>



              </div>

            </div>

          </motion.div>

        )}

      </div>



      {/* Modal Detail Student */}

      <AnimatePresence>

        {selectedStudent && (

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">

            <motion.div 

              initial={{ opacity: 0 }}

              animate={{ opacity: 1 }}

              exit={{ opacity: 0 }}

              onClick={() => setSelectedStudent(null)}

              className="fixed inset-0 bg-black/60 backdrop-blur-sm"

            />

            

            <motion.div 

              initial={{ opacity: 0, scale: 0.95, y: 20 }}

              animate={{ opacity: 1, scale: 1, y: 0 }}

              exit={{ opacity: 0, scale: 0.95, y: 20 }}

              className={cn("relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col", 

                isDarkMode ? "bg-slate-800 text-white border border-slate-700" : "bg-white text-slate-900"

              )}

            >

              {/* Modal Header */}

              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">

                <div>

                  <h2 className="text-xl font-bold">Detail Pendaftar ({selectedStudent['No Pendaftaran']})</h2>

                  <div className="mt-1 flex items-center gap-2">

                    {getStatusBadge(selectedStudent.Status)}

                    {selectedStudent['Jarak ke Sekolah (km)'] && (

                      <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">

                        Jarak: {selectedStudent['Jarak ke Sekolah (km)']} km

                      </span>

                    )}

                  </div>

                </div>

                <button 

                  onClick={() => setSelectedStudent(null)}

                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"

                >

                  <X size={20} />

                </button>

              </div>



              {/* Modal Body */}

              <div className="overflow-y-auto p-6 space-y-6 flex-1">

                {selectedStudent.Status === 'Tidak Lulus' && selectedStudent['Alasan Penolakan'] && (

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl">

                    <p className="text-sm font-bold text-red-800 dark:text-red-400 mb-1">Alasan Penolakan / Tidak Lulus:</p>

                    <p className="text-sm text-red-700 dark:text-red-300">{selectedStudent['Alasan Penolakan']}</p>

                  </div>

                )}



                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Biodata Section */}

                  <div className="space-y-4">

                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-500">Informasi Pribadi</h3>

                    <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2 dark:border-slate-700">

                      <span className="text-slate-400 col-span-1">Nama</span>

                      <span className="font-medium col-span-2">{getFieldValue(selectedStudent, 'Nama Lengkap') || '-'}</span>

                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2 dark:border-slate-700">

                      <span className="text-slate-400 col-span-1">NIK</span>

                      <span className="font-mono col-span-2">{getFieldValue(selectedStudent, 'NIK') || '-'}</span>

                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2 dark:border-slate-700">

                      <span className="text-slate-400 col-span-1">TTL</span>

                      <span className="font-medium col-span-2">

                        {getFieldValue(selectedStudent, 'Tempat Lahir') || '-'}, {formatDate(getFieldValue(selectedStudent, 'Tanggal Lahir'))}

                      </span>

                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2 dark:border-slate-700">

                      <span className="text-slate-400 col-span-1">Usia</span>

                      <span className="font-medium col-span-2 text-blue-600 dark:text-blue-400">

                        {calculateAge(getFieldValue(selectedStudent, 'Tanggal Lahir'), settings?.tanggalCutoffUsia)}

                      </span>

                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2 dark:border-slate-700">

                      <span className="text-slate-400 col-span-1">Jenis Kelamin</span>

                      <span className="font-medium col-span-2">{getFieldValue(selectedStudent, 'Jenis Kelamin') || '-'}</span>

                    </div>

                  </div>



                  {/* Secondary Info / Attachments Section */}

                  <div className="space-y-4">

                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-500">Kontak & Berkas terlampir</h3>

                    

                    {selectedStudent['Koordinat Lokasi'] && (

                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2 dark:border-slate-700">

                        <span className="text-slate-400 col-span-1">Peta Lokasi</span>

                        <span className="col-span-2">

                          <a 

                            href={`https://www.google.com/maps/search/?api=1&query=${selectedStudent['Koordinat Lokasi']}`}

                            target="_blank" 

                            rel="noopener noreferrer"

                            className="inline-flex items-center gap-1 text-blue-500 hover:underline"

                          >

                            Buka Google Maps

                          </a>

                        </span>

                      </div>

                    )}



                    {/* Menampilkan lampiran file jika ada data base64/URL */}

                    <div className="space-y-2 pt-2">

                      <p className="text-xs font-bold text-slate-400">Lampiran Dokumen:</p>

                      <div className="flex flex-wrap gap-2">

                        {Object.keys(selectedStudent).map((key) => {

                          const val = selectedStudent[key as keyof AdminData];

                          if (typeof val === 'string' && val.startsWith('data:image')) {

                            return (

                              <div key={key} className="flex flex-col items-center p-2 border rounded dark:border-slate-700 bg-slate-50 dark:bg-slate-900">

                                <span className="text-xs font-medium mb-1 truncate w-24 text-center">{key}</span>

                                <img 

                                  src={val} 

                                  alt={key} 

                                  className="w-24 h-24 object-cover rounded border dark:border-slate-800 cursor-pointer hover:opacity-80 transition-opacity"

                                  onClick={() => {

                                    const win = window.open();

                                    win?.document.write(`<iframe src="${val}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);

                                  }}

                                />

                              </div>

                            );

                          }

                          return null;

                        })}

                      </div>

                    </div>



                  </div>

                </div>

              </div>



              {/* Modal Footer */}

              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap gap-2 justify-between items-center">

                <button

                  onClick={() => printCard(selectedStudent)}

                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"

                >

                  <Printer size={16} /> Cetak Kartu Bukti

                </button>

                <div className="flex gap-2">

                  {selectedStudent.Status !== 'Lulus' && (

                    <button 

                      onClick={() => handleUpdateStatus(selectedStudent['No Pendaftaran'], 'Lulus')}

                      className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"

                    >

                      <CheckCircle size={16} /> Nyatakan Lulus

                    </button>

                  )}

                  {selectedStudent.Status !== 'Tidak Lulus' && (

                    <button 

                      onClick={() => handleUpdateStatus(selectedStudent['No Pendaftaran'], 'Tidak Lulus')}

                      className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"

                    >

                      <XCircle size={16} /> Tolak / Tidak Lulus

                    </button>

                  )}

                </div>

              </div>



            </motion.div>

          </div>

        )}

      </AnimatePresence>

    </div>

  );

}
