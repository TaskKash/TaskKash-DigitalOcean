
$filePath = "client\src\pages\advertiser\CampaignBuilder.tsx"
$lines = Get-Content $filePath

# Keep lines before step 2 block (up to line 229 = index 228)
$before = $lines[0..228]
# Keep lines after step 2 block (from line 448 = index 447 onwards, which is the closing `)}`)
$after = $lines[448..($lines.Length - 1)]

$newBlock = @'
        {/* Step 2: Advanced Targeting Accordions */}
        {step === 2 && (
          <div className="space-y-4">
            {!reachData.meetsMinimum && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg flex gap-3 border border-red-200">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">Your audience is too narrow (under 500 users). Broaden your filters or remove constraints to launch.</p>
              </div>
            )}

            {/* Geography - TOP */}
            <Accordion type="single" collapsible defaultValue="cat-geo" className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-geo" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded text-teal-600"><Globe className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">Geography &amp; Location</span>
                    {campaign.targeting.countries.length > 0 && <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">{campaign.targeting.countries.length} selected</span>}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6">
                  <div className="border-t pt-4">
                    <Label className="text-base mb-2 block">Target Countries</Label>
                    <p className="text-xs text-gray-500 mb-3">Leave blank to target ALL available countries</p>
                    <div className="flex flex-wrap gap-2">
                      {COUNTRIES.map(c => (
                        <label key={c} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${campaign.targeting.countries.includes(c) ? 'bg-teal-50 border-teal-500 shadow-sm' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.countries.includes(c)} onCheckedChange={() => toggleArrayItem('countries', c)} />
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="text-base mb-2 block">Primary Cities</Label>
                    <div className="flex flex-wrap gap-2">
                      {CITIES.map(city => (
                        <label key={city} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${campaign.targeting.cities.includes(city) ? 'bg-primary/10 border-primary shadow-sm' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.cities.includes(city)} onCheckedChange={() => toggleArrayItem('cities', city)} />
                          <span>{city}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Category 1: Demographics */}
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-1" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded text-blue-600"><Users className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">1. Demographics</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-8 border-t pt-4">
                    <div>
                      <Label className="text-base mb-4 block">Age Range: {campaign.targeting.ageMin || 16} – {campaign.targeting.ageMax || 80}</Label>
                      <Slider defaultValue={[campaign.targeting.ageMin || 16, campaign.targeting.ageMax || 80]} max={80} min={16} step={1}
                        onValueChange={([min, max]) => setCampaign(p => ({...p, targeting: {...p.targeting, ageMin: min, ageMax: max}}))} />
                    </div>
                    <div>
                      <Label className="text-base mb-2 block">Gender</Label>
                      <div className="flex gap-2">
                        {['all', 'male', 'female'].map(g => (
                          <button key={g} onClick={() => setCampaign(p => ({...p, targeting: {...p.targeting, gender: g as any}}))}
                            className={`px-4 py-2 border rounded-md capitalize ${campaign.targeting.gender === g ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200'}`}
                          >{g}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Category 2: Financial */}
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-2" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded text-green-600"><DollarSign className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">2. Financial &amp; Income</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6">
                  <div className="border-t pt-4">
                    <Label className="text-base mb-2 block">Income Level Segments</Label>
                    <div className="flex flex-wrap gap-2">
                      {INCOME_LEVELS.map(inc => (
                        <label key={inc} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.incomeLevels.includes(inc) ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.incomeLevels.includes(inc)} onCheckedChange={() => toggleArrayItem('incomeLevels', inc)} />
                          <span className="capitalize">{inc.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="text-base mb-2 block">Home Ownership</Label>
                    <div className="flex gap-2">
                      {[['', 'Any'], ['owner', 'Owner'], ['renter', 'Renter']].map(([val, label]) => (
                        <button key={val} onClick={() => setCampaign(p => ({...p, targeting: {...p.targeting, homeOwnership: val as any}}))}
                          className={`px-4 py-2 border rounded-md ${campaign.targeting.homeOwnership === val ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200'}`}
                        >{label}</button>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Category 3: Device */}
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-3" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded text-purple-600"><Monitor className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">3. Device &amp; Connectivity</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-8 border-t pt-4">
                    <div>
                      <Label className="mb-2 block">Device Tier</Label>
                      <div className="flex gap-2">
                        {DEVICE_TIERS.map(tier => (
                          <button key={tier} onClick={() => toggleArrayItem('deviceTiers', tier)}
                            className={`px-4 py-2 border rounded-md ${campaign.targeting.deviceTiers.includes(tier) ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200'}`}
                          >Tier {tier}</button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">A = Flagship, B = Mid-range, C = Budget</p>
                    </div>
                    <div>
                      <Label className="mb-2 block">Operating System</Label>
                      <div className="flex gap-2">
                        {[['', 'Any OS'], ['iOS', 'iOS'], ['Android', 'Android']].map(([val, label]) => (
                          <button key={val} onClick={() => setCampaign(p => ({...p, targeting: {...p.targeting, deviceOs: val as any}}))}
                            className={`px-4 py-2 border rounded-md ${campaign.targeting.deviceOs === val ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200'}`}
                          >{label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8 border-t pt-4">
                    <div>
                      <Label className="mb-2 block">Device Brands</Label>
                      <div className="flex flex-wrap gap-2">
                        {DEVICE_BRANDS.map(brand => (
                          <label key={brand} className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm cursor-pointer ${campaign.targeting.deviceBrands.includes(brand) ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                            <Checkbox checked={campaign.targeting.deviceBrands.includes(brand)} onCheckedChange={() => toggleArrayItem('deviceBrands', brand)} />
                            <span>{brand}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Network Carriers</Label>
                      <div className="flex flex-wrap gap-2">
                        {CARRIERS.map(carrier => (
                          <label key={carrier} className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm cursor-pointer ${campaign.targeting.networkCarriers.includes(carrier) ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                            <Checkbox checked={campaign.targeting.networkCarriers.includes(carrier)} onCheckedChange={() => toggleArrayItem('networkCarriers', carrier)} />
                            <span>{carrier}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Connection Type</Label>
                    <div className="flex gap-2 flex-wrap">
                      {CONNECTION_TYPES.map(ct => (
                        <button key={ct} onClick={() => toggleArrayItem('connectionTypes', ct)}
                          className={`px-4 py-2 border rounded-md ${campaign.targeting.connectionTypes.includes(ct) ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200'}`}
                        >{ct}</button>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Category 4: Psychographics */}
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-4" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 rounded text-pink-600"><Activity className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">4. Psychographics &amp; Interests</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6">
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-base block">Primary Interests</Label>
                      <div className="flex items-center gap-2 text-sm bg-gray-100 px-2 py-1 rounded">
                        <span className={!campaign.targeting.interestsMatchAll ? 'font-bold' : 'text-gray-500'}>Match Any (OR)</span>
                        <Checkbox checked={campaign.targeting.interestsMatchAll} onCheckedChange={(c) => setCampaign(p => ({...p, targeting: {...p.targeting, interestsMatchAll: !!c}}))} />
                        <span className={campaign.targeting.interestsMatchAll ? 'font-bold' : 'text-gray-500'}>Match All (AND)</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map(int => (
                        <label key={int} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.interests.includes(int) ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.interests.includes(int)} onCheckedChange={() => toggleArrayItem('interests', int)} />
                          <span>{int}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="text-base mb-2 block">Life Stage</Label>
                    <div className="flex flex-wrap gap-2">
                      {LIFE_STAGES.map(stage => (
                        <label key={stage} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer capitalize ${campaign.targeting.lifeStages.includes(stage) ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.lifeStages.includes(stage)} onCheckedChange={() => toggleArrayItem('lifeStages', stage)} />
                          <span>{stage.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Category 5: Behavioral */}
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-5" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded text-orange-600"><Tag className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">5. Behavioral &amp; Purchase Intent</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6">
                  <div className="border-t pt-4">
                    <Label className="text-base mb-2 block">Shopping Frequency</Label>
                    <div className="flex gap-2 flex-wrap">
                      {SHOPPING_FREQS.map(freq => (
                        <button key={freq} onClick={() => toggleArrayItem('shoppingFrequencies', freq)}
                          className={`px-4 py-2 border rounded-md capitalize ${campaign.targeting.shoppingFrequencies.includes(freq) ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200'}`}
                        >{freq}</button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-base block">Next 6 Months Purchase Intent</Label>
                      <div className="flex items-center gap-2 text-sm bg-gray-100 px-2 py-1 rounded">
                        <span className={!campaign.targeting.nextPurchaseIntentMatchAll ? 'font-bold' : 'text-gray-500'}>Match Any (OR)</span>
                        <Checkbox checked={campaign.targeting.nextPurchaseIntentMatchAll} onCheckedChange={(c) => setCampaign(p => ({...p, targeting: {...p.targeting, nextPurchaseIntentMatchAll: !!c}}))} />
                        <span className={campaign.targeting.nextPurchaseIntentMatchAll ? 'font-bold' : 'text-gray-500'}>Match All (AND)</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {PURCHASE_INTENTS.map(intent => (
                        <label key={intent} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${campaign.targeting.nextPurchaseIntent.includes(intent) ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.nextPurchaseIntent.includes(intent)} onCheckedChange={() => toggleArrayItem('nextPurchaseIntent', intent)} />
                          <span>{intent}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Category 6: Mobility & Household - RESTORED */}
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-6" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded text-slate-600"><Briefcase className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">6. Mobility &amp; Household</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-8 border-t pt-4">
                    <div>
                      <Label className="mb-2 block">Vehicle Owner</Label>
                      <div className="flex gap-2">
                        {([['any', 'Any'], ['yes', 'Car Owner ✓'], ['no', 'Non-Owner ✗']] as const).map(([val, label]) => (
                          <button key={val}
                            onClick={() => {
                              const v = val === 'any' ? undefined : val === 'yes';
                              setCampaign(p => ({...p, targeting: {...p.targeting, hasVehicle: v}}));
                            }}
                            className={`px-3 py-2 border rounded-md text-sm ${
                              (val === 'any' && campaign.targeting.hasVehicle === undefined) ||
                              (val === 'yes' && campaign.targeting.hasVehicle === true) ||
                              (val === 'no' && campaign.targeting.hasVehicle === false)
                                ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200'
                            }`}
                          >{label}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Work Type</Label>
                      <div className="flex flex-wrap gap-2">
                        {WORK_TYPES.map(wt => (
                          <button key={wt} onClick={() => toggleArrayItem('workTypes', wt)}
                            className={`px-3 py-1.5 border rounded-md text-sm capitalize ${campaign.targeting.workTypes.includes(wt) ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200'}`}
                          >{wt.replace('_', ' ')}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Vehicle Brand (for car owners)</Label>
                    <div className="flex flex-wrap gap-2">
                      {VEHICLE_BRANDS.map(brand => (
                        <label key={brand} className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm cursor-pointer ${campaign.targeting.vehicleBrands.includes(brand) ? 'bg-primary/10 border-primary' : 'bg-white hover:bg-gray-50'}`}>
                          <Checkbox checked={campaign.targeting.vehicleBrands.includes(brand)} onCheckedChange={() => toggleArrayItem('vehicleBrands', brand)} />
                          <span>{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="mb-3 block">Household Size: {campaign.targeting.householdSizeMin || 1} – {campaign.targeting.householdSizeMax || 10} members</Label>
                    <Slider
                      defaultValue={[campaign.targeting.householdSizeMin || 1, campaign.targeting.householdSizeMax || 10]}
                      max={10} min={1} step={1}
                      onValueChange={([min, max]) => setCampaign(p => ({...p, targeting: {...p.targeting, householdSizeMin: min, householdSizeMax: max}}))}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Category 7: Engagement Quality */}
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm border">
              <AccordionItem value="cat-7" className="border-b-0 px-6">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded text-yellow-600"><Crown className="w-4 h-4" /></div>
                    <span className="font-semibold text-lg">7. Engagement &amp; Trust Tiers</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-8 border-t pt-4">
                    <div>
                      <Label className="mb-2 block">Isolate Specific Tiers</Label>
                      <div className="flex gap-2 flex-wrap">
                        {['bronze', 'silver', 'gold', 'platinum'].map(t => (
                          <label key={t} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer capitalize ${campaign.targeting.tiers.includes(t) ? 'bg-primary/10 border-primary' : 'bg-white'}`}>
                            <Checkbox checked={campaign.targeting.tiers.includes(t)} onCheckedChange={() => toggleArrayItem('tiers', t)} />
                            <span>{t}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Minimum Profile Strength: {campaign.targeting.profileStrengthMin || 0}%</Label>
                      <Slider defaultValue={[campaign.targeting.profileStrengthMin || 0]} max={100} min={0} step={5}
                        onValueChange={([v]) => setCampaign(p => ({...p, targeting: {...p.targeting, profileStrengthMin: v}}))} />
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Minimum Tasks Completed: {campaign.targeting.completedTasksMin || 0}</Label>
                    <Slider defaultValue={[campaign.targeting.completedTasksMin || 0]} max={500} min={0} step={10}
                      onValueChange={([v]) => setCampaign(p => ({...p, targeting: {...p.targeting, completedTasksMin: v}}))} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
'@

$newLines = $newBlock -split "`n"
$combined = $before + $newLines + $after
Set-Content -Path $filePath -Value $combined -Encoding UTF8
Write-Output "Done! Lines replaced successfully."
