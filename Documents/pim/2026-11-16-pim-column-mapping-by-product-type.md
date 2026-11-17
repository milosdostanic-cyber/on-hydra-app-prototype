# Proposed display mapping, by product type

The Syndigo export checked on 16 November 2026 has 526 columns and 67,767 rows. Dimension A through Z and Export Assistance are no longer in the Syndigo export. They stay on the leave-out list so the next export can be compared. There are 290 product types and 65,988 sellable SKUs. This mapping uses 20 groups. Two further rows stay open: rows with no product type, and six product types that cover more than one kind of product.

A figure is the product page. A SKU is the selected variant. An empty cell is hidden, and a placeholder cell is hidden. One fact is shown once when Syndigo stores it in several columns. The variant table shows the SKU, the variant display name, and up to five differences. The selected SKU shows the rest of that SKU's fields. UPC stays on the selected SKU.

Every product type below also uses the figure columns and the SKU columns. Size 1, Size 2, and Size 3, and the certification columns, are defined here and then named in the table.

## On every figure

| What the page shows | PIM columns (Syndigo) |
| --- | --- |
| Figure number | M3 Figure Number |
| Part name. A cell that still says No Category keeps that name until the source cell is corrected. | Web Category |
| Catalog breadcrumb. Not a SKU column. | Web Classification |
| Part image. Until this image is filled, the page uses the SKU photo. | Web Category Image |
| Long description. Descriptions can differ by SKU. A missing description is not taken from another SKU. For now the figure shows one text, until we see where on the page a SKU description should be shown. | Description - Long |
| Marketing description | Marketing Description |
| Series, when it differs from the figure number | Series |
| One submittal. When one SKU in the figure has the file, the page uses that file, and only from the same figure. | Submittal / Data Sheet, Product Specification |
| German submittal, when the cell is a link | Submittal / Data Sheet - German |
| Product page link, when the cell is a link. An image in this cell stays the product page link. | Product URL |
| Applications, Keywords, and Bulleted Feature 1 through 10, when the cell has a value | Applications, Keywords, Bulleted Feature 1 through Bulleted Feature 10 |

## On every selected SKU

| What the page shows | PIM columns (Syndigo) |
| --- | --- |
| Variant name. Shown when the display name is empty. | Product Name, Name. The two columns hold the same value. |
| Variant display name in the UI. | Marketing Name. When that cell is empty, the display name is Product Name. |
| SKU. The SKU is the item number already on the product, such as 7A99001499. | Item Number / SKU |
| Brand | Product Brand |
| Product type | Product Type |
| Product classification | Product Classification |
| Variant photo. A photo stays on the SKU that has it. | Product Photography |
| Weight | Approximate Weight / Each, Approximate Weight / Each.UOM |
| These fields, when the cell has a value | Country of Origin, Source, UPC Code, Prop 65 Eligible?, Prop 65 Warning Label, Prop 65 Chemical, Prop 65 Chemical Cancer, Prop 65 Chemical Reproductive |
| BIM link, when the cell is a link | B.I.M. Link - Figure, B.I.M. Link - Sku, B.I.M. Link - Category |

## One field from several columns

Size 1 is Nominal Size.Dimension 1, Nominal Size.Dimension 1.UOM, Nominal Pipe Size (Fraction), Nominal Pipe Size (Decimal), Nominal Pipe Size (Decimal).UOM, and Nominal Pipe Size UOM.

Size 2 is Nominal Size.Dimension 2, Nominal Size.Dimension 2.UOM, Nominal Pipe Size Dimension II (Fraction), Nominal Pipe Size (Decimal) II, Nominal Pipe Size (Decimal) II.UOM, and Nominal Pipe Size UOM II.

Size 3 is Nominal Size.Dimension 3, Nominal Size.Dimension 3.UOM, Nominal Pipe Size Dimension III (Fraction), Nominal Pipe Size (Decimal) III, Nominal Pipe Size (Decimal) III.UOM, and Nominal Pipe Size UOM III.

The 16 certification columns are ANSI Certified, API Specification, ASME Specification, ASSE Standard, ASTM Specification, AWWA Specification, CISPI Standard, CSA Certified, FM Approved, IAPMO Listed, ISO Specification, MSS Specification, NFPA Standard, NSF Standard, Potable Water Code, and UL Listed. These new columns replace the legacy Regulatory column. Until that replacement, Regulatory is the fallback when none of the 16 has a value.

| One field on the page | How the columns are read |
| --- | --- |
| Variant name. Shown when the display name is empty. | Product Name and Name hold the same value on all 67,767 export rows. |
| Variant display name in the UI. | Marketing Name. When that cell is empty, the display name is Product Name. |
| Material. Both texts stay visible where they disagree. | Body, Main Material. Body is the column in use. On 35 rows the two texts disagree, so both stay visible. |
| Submittal. The two columns agree where both are filled. The figure uses one submittal, and only from the same figure. | Submittal / Data Sheet, Product Specification |
| One size for each end | Size 1, Size 2, and Size 3. The fraction and the decimal for one end are not both filled. Where both writings exist, they agree about 99 percent of the time. |
| Valve size on Reliable valves, risers, and controls | Valve Size and Nominal Pipe Size (Decimal), with Nominal Pipe Size (Decimal).UOM and Nominal Pipe Size UOM. Show Valve Size, and show the decimal when Valve Size is empty. Where the two disagree, keep Valve Size. |
| One unit for each end | The nominal-size unit, the pipe-size unit, and the decimal unit hold the same unit. The page shows that unit once. |
| Weight unit | Approximate Weight / Each.UOM. Weight UOM is empty, apart from one placeholder, and it is not the weight unit. |
| Each certification stays separate. Regulatory is the legacy fallback when none of the 16 has a value. | The 16 certification columns, then Regulatory. |
| One end, when the two ends are the same, on Reliable valves, risers, and controls | Riser End Configuration when that cell has a value, otherwise Valve End Connection. When both are empty, the page shows End Connection 1 and End Connection 2. |
| Bell diameter | Nominal Pipe Size (Fraction), Nominal Pipe Size UOM, Nominal Size.Dimension 1, and Nominal Size.Dimension 1.UOM. These columns hold the bell diameter on Alarm Bell. They are not a pipe size. |

Actual Size / O.D. is not a size. Those six columns are empty. Filling them would repeat a size the page already shows.

## Columns by group

Shared columns apply to every type in the group. A line under Only some types applies to the types named there. A parenthesis is the meaning for that type. Product-type names are spelled as Syndigo stores them.

| Group | Product types | Columns | Notes |
| --- | --- | --- | --- |
| Single-opening ends | Bull Plug; Cap; Drain Cap; Plug; Tube End | Shared: Size 1, End Connection 1, Body, Main Material, Coating / Finish, Finish Detail, Product Color, certification columns<br>&nbsp;<br>Only some types:<br>• Size 2 on Bull Plug (plug length), Cap, Drain Cap (end-to-end length), Plug<br>• End Connection 2 on Bull Plug, Cap, Drain Cap<br>• Stainless Steel Type on Cap, Plug, Tube End<br>• Body Detail on Plug | Products with one opening.<br>Size 2 is a length on one opening, not a second end.<br>On Cap, a filled Size 2 is the center-tap size on some rows. Drain Cap Size 2 is filled on 2 rows. The filled value stays on the page. The stored value stays.<br>End Connection 2 is filled on Bull Plug, Cap, and Drain Cap. The filled value stays on the page. The stored value stays. |
| Two-opening fittings | Adapter; Adapter Nipple; Bell Nipple; Bushing; Concentric Reducer; Coupling; Dielectric Adapter; Drain Fitting; Eccentric Reducer; Elbow; Expansion Joint; Flange; Flange Adapter; Flanged Nipple; Flexible Coupling; Insert Fitting; Pipe Nipple; Pipe Nipples; Reducer; Reducing Coupling; Return Bend; Rigid Coupling; Sanitary Fitting; Swaged Nipple; Threaded Extension Piece; Transition Coupling; Tubing Nipple; Union | Shared: Size 1, Size 2, End Connection 1, End Connection 2, Body, Main Material, Coating / Finish, Finish Detail, Body Detail, Stainless Steel Type, Product Color, certification columns<br>&nbsp;<br>Only some types:<br>• Size 3 on Adapter (third diameter), Bushing (third size, shown where populated), Concentric Reducer (third size, shown where populated), Eccentric Reducer (third size, shown where populated), Elbow (third diameter, filled when the elbow is reducing), Reducer (third size, shown where populated), Swaged Nipple (third diameter), Tubing Nipple (third diameter)<br>• Elbow Angle on Adapter, Elbow (kept when the row has no degree), Flange, Flexible Coupling, Pipe Nipple, Pipe Nipples, Reducer (kept when the row has no degree), Return Bend (kept when the row has no degree), Union | Products with two openings.<br>An empty Size 3 on the other types is not missing data.<br>Bushing, Concentric Reducer, Eccentric Reducer, and Reducer have two openings. Size 3 stays on those types and is shown where it is populated.<br>Elbow, Reducer, and Return Bend keep Elbow Angle when the row has no degree.<br>Elbow Angle stays on Adapter, Flange, Flexible Coupling, Pipe Nipple, Pipe Nipples, and Union. The stored values stay. |
| Multi-opening fittings | Anvilet; Branch Outlet; Cross; Lateral; Olet; Outlet Manifold; Tee; Wye | Shared: Size 1, Size 2, Size 3, End Connection 1, End Connection 2, Body, Main Material, Coating / Finish, Finish Detail, Body Detail, Stainless Steel Type, Product Color, certification columns<br>&nbsp;<br>Only some types:<br>• Elbow Angle on Branch Outlet, Lateral (kept when the row has no degree), Outlet Manifold, Tee (kept when the row has no degree), Wye (kept when the row has no degree) | Products with three or more openings, including tees and crosses.<br>Lateral, Tee, and Wye keep Elbow Angle when the row has no degree.<br>Bushing, Concentric Reducer, Eccentric Reducer, and Reducer are in Two-opening fittings. Size 3 stays on those types and is shown where it is populated.<br>Cross has four openings. Size 3 stays on this group when the cell is empty. |
| Commercial and industrial valves | ASME Forged Steel Piston Check Valve; ASME Forged Steel Swing Check Valve; Automatic Air Vent; Automatic Balancing Valve; Balancing Valve; Ball Valve; Bent Nose Garden Valve; Boiler Drain; Butterfly Valve; Check Valve; Circuit Balancing Valve; Circuit Balancing Valve Needle; Concentric Butterfly Valve; Control Ball Valve; CPVC Ball Valve; Diverter Ball Valve; Double Offset Butterfly Valve; Evaporator Valve; Flanged ASME Ball Valves; Flanged ASME Check Valves; Flanged ASME Gate Valves; Flanged ASME Globe Valves; Float Valve; Gate Valve; Globe Valve; Ground Key Stop and Drain; Hose Bibb; Multi-Port Ball Valve; Needle Valve; On/Off Terminal Low Lead Balancing Valve; Pressure Relief Valve; PVC Ball Valve; Quarter Turn Hose Bibb; Quarter Turn No Kink Hose Bibb; Rubber Seated Butterfly Valve; Sillcock Valve; Straight Stop Valve; Swing Check Valve; Test and Drain; Triple Offset Butterfly Valves; Union Ball Valve; Washing Machine Valve; Wedge Gate Valves; Y-Style Circuit Balancing Valve | Shared: Size 1, Size 2, End Connection 1, End Connection 2, Body, Main Material, Coating / Finish, Finish Detail, Body Detail, Stainless Steel Type, Product Color, certification columns<br>&nbsp;<br>Only some types:<br>• Size 3 on Diverter Ball Valve (third port), Multi-Port Ball Valve (third port) | Check Valve is the FPPI, Gruvlok, Kennedy Valve, and SCI product.<br>Pressure Relief Valve is one FPPI row. Test and Drain is the FPPI accessory.<br>Elbow Angle is filled on the ball valves, the butterfly valves, and Check Valve. It stays hidden on the page until Lauren verifies the filled values. The stored values stay. |
| Reliable valves, risers, and controls | Automatic Control Valves; Check Valves; Pressure Reducing Valves; Relief Valves; Riser Assemblies & Kits; Sprinkler Controls, Sensors, Alarms & Parts; Test & Drain Valves; Valve Repair Kits | Shared: Valve Size, Nominal Pipe Size (Decimal), Nominal Pipe Size (Decimal).UOM, Nominal Pipe Size UOM, Valve End Connection, Valve Type, Trim Type, Trim Control Valve, Coating / Finish, Finish Detail, certification columns<br>&nbsp;<br>Only some types:<br>• Riser Size, Riser Drain Valve, Riser Pressure Relief, Riser Waterflow Detector, Riser End Configuration on Automatic Control Valves; Check Valves; Pressure Reducing Valves; Relief Valves; Riser Assemblies & Kits; Sprinkler Controls, Sensors, Alarms & Parts; Test & Drain Valves | This group is the Reliable types filled with Valve Size, valve end, valve type, and trim. Commercial valves use a size per port instead.<br>Check Valves is the Reliable product.<br>Show Valve Size, and show the decimal when Valve Size is empty. Where the two disagree, keep Valve Size.<br>The riser columns apply to every type except Valve Repair Kits.<br>One end is shown when the two ends are the same.<br>When Riser End Configuration and Valve End Connection are both empty, the page shows End Connection 1 and End Connection 2. |
| Sprinkler heads and cover plates | Escutcheons; Sprinkler Cover Plates & Escutcheons; Sprinkler Heads | Shared: Nominal Pipe Size (Decimal), Nominal Pipe Size (Decimal).UOM, Nominal Pipe Size UOM, Coating / Finish, Finish Detail, End Connection 1, certification columns<br>&nbsp;<br>Only some types:<br>• K-Factor, SIN, Temperature, Orientation, Sensitivity on Sprinkler Heads<br>• K-Factor, SIN on Escutcheons, Sprinkler Cover Plates & Escutcheons (show only when the cell has a value) | These types do not use Valve Size. |
| Sprinkler trim | Bell Guard; Kydex Ring; One-Piece Heavy Gauge Steel Canopy; One-Piece Light Gauge Steel Canopy; One-Piece Plastic Canopy; One-Piece Sprinkler Head Guard; Pendent Canopy Skirt; Pendent Steel Cup; Plastic Wall Plates Floor/Ceiling; Recessed Canopy Coverage Plate; Rod Button; Sprinkler Head Guard; Steel Hinged Wall Plate; Threaded Recessed Sprinkler Escutcheon; Three-Piece Recessed Canopy with Split Retainer; Two-Piece Cup for Pendent Sprinkler; Two-Piece Pendent Canopy; Two-Piece Recessed Short Skirt; Two-Piece Sprinkler Head Guard; Water Shield | Shared: Size 1, Body, Main Material, Coating / Finish, Finish Detail, Product Color, Body Detail, certification columns<br>&nbsp;<br>Only some types:<br>• Size 2 on One-Piece Heavy Gauge Steel Canopy |  |
| Alarm bells | Alarm Bell | Shared: certification columns, Nominal Pipe Size (Fraction), Nominal Pipe Size UOM, Nominal Size.Dimension 1, Nominal Size.Dimension 1.UOM | These size columns hold the bell diameter. |
| Actuators and solenoids | Actuator; Anodized; Declutchable Manual Overrides; Digital (smart) Valve Postioner; Digital Valve Postioner; Electric Actuator; Electric Actuator, 2-Position; Electro-pneumatic Valve Postioner; Electropneumatic Valve Postioner; Gear Operator; Gear Operator, Kit; Pneumatic Actuator; Pneumatic Actuator, Double Acting, Quarter Turn; Pneumatic Actuator, Spring Return (CW), Quarter Turn; Pneumatic Valve Positioner; Rotary Limit Switch; Solenoid Valve; Solenoid Valve Adapter Plate; Solenoid Valve Body; Solenoid Valve Coil; Solenoid Valve Conversion Plug; Stem Extension Kit - Butterfly Valve | Shared: Body, Main Material, Coating / Finish, Finish Detail, certification columns<br>&nbsp;<br>Only some types:<br>• Size 1 on Anodized; Declutchable Manual Overrides; Digital (smart) Valve Postioner; Digital Valve Postioner; Electric Actuator; Electric Actuator, 2-Position; Electro-pneumatic Valve Postioner; Electropneumatic Valve Postioner; Gear Operator; Gear Operator, Kit; Pneumatic Actuator; Pneumatic Actuator, Double Acting, Quarter Turn; Pneumatic Actuator, Spring Return (CW), Quarter Turn; Pneumatic Valve Positioner; Rotary Limit Switch; Solenoid Valve; Solenoid Valve Adapter Plate; Solenoid Valve Body; Solenoid Valve Coil; Solenoid Valve Conversion Plug (decimal columns empty); Stem Extension Kit - Butterfly Valve<br>• Size 2 on Anodized; Declutchable Manual Overrides; Digital (smart) Valve Postioner; Digital Valve Postioner (unit column empty); Electric Actuator; Electric Actuator, 2-Position; Electro-pneumatic Valve Postioner; Electropneumatic Valve Postioner; Gear Operator; Gear Operator, Kit (unit column empty); Pneumatic Actuator; Pneumatic Actuator, Double Acting, Quarter Turn; Pneumatic Actuator, Spring Return (CW), Quarter Turn; Pneumatic Valve Positioner; Rotary Limit Switch; Solenoid Valve; Solenoid Valve Adapter Plate; Solenoid Valve Body; Solenoid Valve Coil<br>• Body Detail on Declutchable Manual Overrides, Pneumatic Actuator, Stem Extension Kit - Butterfly Valve<br>• End Connection 1, End Connection 2 on Digital Valve Postioner, Electropneumatic Valve Postioner, Pneumatic Actuator<br>• Stainless Steel Type on Pneumatic Actuator, Stem Extension Kit - Butterfly Valve | Anodized is five Quadrant actuators. The type name is a finish. They stay in this group.<br>Size 2 is filled. The filled value stays on the page. The stored value stays. Elbow Angle is filled. It stays hidden on the page until Lauren verifies the filled values. The stored values stay.<br>Size 1 on Solenoid Valve Coil, Solenoid Valve Conversion Plug, Solenoid Valve Adapter Plate, Rotary Limit Switch, and Declutchable Manual Overrides is filled. The filled value stays on the page. The stored value stays. |
| Valve parts and kits | Component, Body; Component, Lever - Butterfly Valve; Component, Op Nut, Gear Operator; Component, Plate - Butterfly Valve; Component, Screen, 18 Mesh; Component, Seat; Component, Stem Packing; Handle; Handle Kit; Indicator Post; Insulation Kit; Lever Handle; Repair Kit; Seat | Shared: Size 1, Body, Main Material, Coating / Finish, Finish Detail, certification columns<br>&nbsp;<br>Only some types:<br>• End Connection 1, End Connection 2 on Component, Body; Component, Lever - Butterfly Valve; Component, Stem Packing; Handle; Insulation Kit; Repair Kit; Seat<br>• Stainless Steel Type on Component, Lever - Butterfly Valve; Component, Screen, 18 Mesh; Handle; Repair Kit<br>• Nominal Pipe Size (Decimal) II, Nominal Pipe Size (Decimal) II.UOM, Nominal Pipe Size Dimension II (Fraction), Nominal Pipe Size UOM II on Handle, Seat<br>• Body Detail, Size 2 on Repair Kit | Repair Kit is the Sharpe, Quadrant, and SCI kit. Valve Repair Kits is the Reliable kit, in Reliable valves, risers, and controls.<br>Size 2 on Repair Kit is filled. The filled value stays on the page. The stored value stays. Elbow Angle is stored on Repair Kit and stays hidden on the page until Lauren verifies the filled values. The stored values stay. |
| Strainers and diffusers | Basket Strainer; Sight Glass; Strainer; Suction Diffuser; Tee Strainer; Wye Strainer | Shared: Size 1, Size 2, End Connection 1, End Connection 2, Body, Main Material, Coating / Finish, Finish Detail, certification columns<br>&nbsp;<br>Only some types:<br>• Stainless Steel Type on Basket Strainer, Sight Glass, Tee Strainer, Wye Strainer<br>• Product Color on Strainer | Sight Glass uses a port size and a body material. Fire-protection accessories and valve parts share this type.<br>Tee Strainer is one row. It sits with the strainers. |
| Gauges | Liquid Filled Pressure Gauge; Pressure Gauge; Pressure Gauges | Shared: Size 1, Body, Main Material, Coating / Finish, Finish Detail, certification columns<br>&nbsp;<br>Only some types:<br>• Size 2 on Liquid Filled Pressure Gauge, Pressure Gauge | Pressure Gauge is one unbranded accessory. Pressure Gauges is the Reliable gauge. Neither type uses Valve Size.<br>Size 2 is filled on Liquid Filled Pressure Gauge and Pressure Gauge. The filled value stays on the page. The stored value stays. |
| Gaskets and seals | Body Seal; Gasket; Gasket Flange | Shared: Size 1, Body, Main Material, Coating / Finish, Finish Detail, certification columns, End Connection 1, End Connection 2<br>&nbsp;<br>Only some types:<br>• Body Detail, Stainless Steel Type on Body Seal<br>• Product Color on Gasket, Gasket Flange<br>• Size 2 on Gasket | Size 2 on Gasket is filled. The filled value stays on the page. The stored value stays. |
| Flexible drops and hose | Drop Nipple Hose; FlexHead® Bracket; FlexHead® Hose; FlexHead� Hose; Flexible Pipe; SprinkFlex® Bracket; SprinkFlex® Hose; SprinkFlex® Inlet Nipple; SprinkFlex® Sprinkler Reducer; SuperFlex® Hose; SuperFlex� Hose; Tri-Flex Loop; Ultra SprinkFlex® Component; Ultra SprinkFlex® Hose; Ultra SprinkFlex� Component; Ultra-SprinkFlex Hoses & Components | Shared: Size 1, Size 2, End Connection 1, End Connection 2, Body, Main Material, Coating / Finish, Finish Detail, Stainless Steel Type, certification columns<br>&nbsp;<br>Only some types:<br>• Body Detail on FlexHead® Bracket, FlexHead® Hose, SprinkFlex® Hose, SprinkFlex® Inlet Nipple, Ultra SprinkFlex® Component, Ultra SprinkFlex� Component, Ultra-SprinkFlex Hoses & Components<br>| The odd character in FlexHead, SuperFlex, and Ultra SprinkFlex is the registered mark, which did not export. Those headings stay as separate names. Elbow Angle is stored on FlexHead® Hose, SprinkFlex® Hose, SprinkFlex® Sprinkler Reducer, SuperFlex® Hose, and Ultra SprinkFlex® Hose, and it stays hidden on the page until Lauren verifies the filled values. The stored values stay. |
| Standpipe and fire-hose equipment | Ball Drips; Breakable Cap; Cap with Chain; Check Snoot; Expansion Tank; FDC Residential Single Inlet; Fog Nozzle; Hose Valve; Open Snoot; Open Snoot Assembly; Plug with Chain; Rack and Reel Fire Hose; Rack Nipple; Replacement Swivel Kit; Siamese FDC Double Clapper; Storz Connection; Storz Kit | Shared: Size 1, End Connection 1, End Connection 2, Body, Main Material, Coating / Finish, Finish Detail, Product Color, certification columns<br>&nbsp;<br>Only some types:<br>• Size 2 on Ball Drips, Check Snoot, Expansion Tank, FDC Residential Single Inlet, Fog Nozzle, Hose Valve, Open Snoot, Open Snoot Assembly, Rack and Reel Fire Hose, Rack Nipple, Replacement Swivel Kit, Siamese FDC Double Clapper, Storz Connection, Storz Kit<br>• Body Detail on Cap with Chain, Check Snoot, Expansion Tank, Hose Valve, Open Snoot, Open Snoot Assembly, Plug with Chain, Siamese FDC Double Clapper<br>| Elbow Angle is stored on Expansion Tank and Siamese FDC Double Clapper, and it stays hidden on the page until Lauren verifies the filled values. The stored values stay. |
| Tools | Fire Hose & Accessories; Hydrant Wrench; Spanner Wrench; Sprinkler Wrenches | Shared: Size 1, Coating / Finish, Finish Detail<br>&nbsp;<br>Only some types:<br>• ASME Specification, ASTM Specification, End Connection 1, End Connection 2, ISO Specification, Product Color on Spanner Wrench | This group does not take the full certification set.<br>Fire Hose & Accessories is one Reliable wrench. |
| Sealants, oil, tape, brushes, and locks | APS Anaerobic Porosity Sealant; AS Thread Sealing Paste with PTFE; Break Shackle Lock; Brush; Dope Brush; Fire Stop Sealant for CPVC; Lubricant; Master Break Lock; Pipe Fit Paint Marker; Sealant; Thread Fit Clear Cutting Oil; Thread Seal Tape; Thread Sealing Paste with PTFE; Threadfit Dark Cutting Oil | Shared: Body, Main Material, Product Color<br>&nbsp;<br>Only some types:<br>• ASTM Specification on Fire Stop Sealant for CPVC, Sealant<br>• Coating / Finish on Lubricant, Pipe Fit Paint Marker, Sealant, Thread Fit Clear Cutting Oil, Thread Sealing Paste with PTFE, Threadfit Dark Cutting Oil<br>• NSF Standard on Lubricant<br>• FM Approved, MSS Specification, UL Listed on Thread Seal Tape | This group does not take the full certification set.<br>A pipe size on these rows is not a column for this group. |
| Identification | Sign Chain; Spare Sprinkler Head Cabinet; Sprinkler Identification Decals; Sprinkler Identification Sign | Shared: Coating / Finish, Finish Detail, Product Color, Body, Main Material<br>&nbsp;<br>Only some types:<br>• ASME Specification, ASTM Specification, End Connection 1 on Sign Chain, Spare Sprinkler Head Cabinet, Sprinkler Identification Sign<br>• End Connection 2, ISO Specification, Nominal Pipe Size (Fraction), Nominal Pipe Size UOM, Nominal Size.Dimension 1, Nominal Size.Dimension 1.UOM on Sign Chain, Spare Sprinkler Head Cabinet<br>• Size 1 on Sprinkler Identification Decals (height), Sprinkler Identification Sign (height)<br>• Size 2 on Sprinkler Identification Decals (width), Sprinkler Identification Sign (width)<br>• FM Approved, NFPA Standard, NSF Standard, UL Listed on Sprinkler Identification Sign | This group does not take the full certification set.<br>A pipe size and an end connection on Sign Chain and Spare Sprinkler Head Cabinet are filled. The filled value stays on the page. The stored value stays. Height and width stay on the decals and the signs. |
| Fasteners and rod hardware | Channel Nut; Drop-In Anchor; Eye Nut; Hanger Rod; Hex Nut; Lag Screw; Machine Bolt; Nut; Rod Coupling; Socket; Toggle Wing; Washer; Weldless Eye Nut | Shared: Size 1, Body, Main Material, Coating / Finish, Finish Detail, Product Color, certification columns<br>&nbsp;<br>Only some types:<br>• Size 2 on Channel Nut, Hanger Rod, Lag Screw, Machine Bolt, Nut, Rod Coupling, Washer<br>• End Connection 1 on Eye Nut, Hanger Rod, Hex Nut, Nut, Rod Coupling, Socket, Washer, Weldless Eye Nut<br>• Stainless Steel Type on Hanger Rod, Hex Nut, Nut<br>• End Connection 2 on Nut<br>• Nominal Pipe Size (Decimal) III, Nominal Pipe Size (Decimal) III.UOM, Nominal Pipe Size Dimension III (Fraction), Nominal Pipe Size UOM III on Rod Coupling | Size 2 on Channel Nut, Lag Screw, Machine Bolt, Nut, and Washer is filled. The fastener size is Size 1. Size 2 stays on Hanger Rod and Rod Coupling. Elbow Angle is stored on Hanger Rod and Washer, and it stays hidden on the page until Lauren verifies the filled values. The stored values stay. |
| Hangers, strut, and supports | Angle Fitting and Connector; Anvil Shield; Beam Clamp; Bracket; Cable Hanger; Ceiling Flange; Ceiling Plate; Channel; Channel Hardware; Clevis Hanger; Clevis Hanger and Shield; ClevisHanger; Concrete Insert; CPVC Hanger; Cushion Clamp; Dakota Strut; End Cap; Flat Plate; H-Bock Rooftop Support; Hinge Connector; Insulation Shield; Pipe Clamp; Pipe Restraint; Pipe Roll and Saddle; Pipe Roller; Pipe Saddle; Pipe strap; Post Base; Pre-Insulated Insert; Ring Hanger; Riser Clamp; Seismic Bracing; Seismic Restraint; Slides and Guides; Snubbers; Structural Attachment; Strut Clamp; Strut Clamp with Insulation Guide; Strut Fitting; System Pipe Attachment; Trapeze; Tubing Clamp; U Support; U-Bolt and Strap; Wall Bracket; Welded Attachment; Welded Structural Attchment; Wing Fitting; Z Support | Shared: Size 1, Body, Main Material, Coating / Finish, Finish Detail, Product Color, Stainless Steel Type, certification columns<br>&nbsp;<br>Only some types:<br>• Elbow Angle on Angle Fitting and Connector, Beam Clamp, Bracket, Cable Hanger, Channel Hardware, CPVC Hanger, H-Bock Rooftop Support, Pipe Clamp, Pipe Restraint, Pre-Insulated Insert, Strut Clamp, Strut Fitting, Trapeze, Wall Bracket<br>• End Connection 1 on Angle Fitting and Connector, Anvil Shield, Beam Clamp, Bracket, Ceiling Flange, Channel Hardware, Clevis Hanger, ClevisHanger, Concrete Insert, CPVC Hanger, Flat Plate, Pipe Clamp, Pipe Roll and Saddle, Pipe Roller, Pipe Saddle, Pipe strap, Pre-Insulated Insert, Ring Hanger, Riser Clamp, Seismic Bracing, Seismic Restraint, Slides and Guides, Snubbers, Structural Attachment, Strut Fitting, Tubing Clamp, U-Bolt and Strap, Welded Attachment<br>• End Connection 2 on Angle Fitting and Connector, Beam Clamp, Channel Hardware, Flat Plate, Pipe Clamp, Pre-Insulated Insert, Seismic Bracing, Snubbers<br>• Size 2 on Angle Fitting and Connector, Beam Clamp, Bracket, Cable Hanger, Channel, Channel Hardware, Clevis Hanger, Clevis Hanger and Shield, ClevisHanger, Concrete Insert, CPVC Hanger, Cushion Clamp, H-Bock Rooftop Support, Insulation Shield, Pipe Clamp, Pipe Roll and Saddle, Pipe Roller, Pipe Saddle, Pipe strap, Pre-Insulated Insert, Ring Hanger, Riser Clamp, Seismic Bracing, Seismic Restraint, Slides and Guides, Snubbers, Structural Attachment, Strut Clamp, Strut Clamp with Insulation Guide, Strut Fitting, System Pipe Attachment, Trapeze, Tubing Clamp, U-Bolt and Strap<br>• Body Detail on Channel Hardware, Clevis Hanger, H-Bock Rooftop Support, Insulation Shield, Pipe Roll and Saddle, Pipe Saddle, Pre-Insulated Insert, Ring Hanger, Seismic Bracing<br>• Nominal Pipe Size (Decimal) III, Nominal Pipe Size (Decimal) III.UOM, Nominal Pipe Size Dimension III (Fraction), Nominal Pipe Size UOM III on Clevis Hanger and Shield, Insulation Shield, Pre-Insulated Insert, Trapeze | Elbow Angle stays on these hangers. The stored values stay. |
| Rows that still need a product type | (no product type); N/A | Filled columns: ANSI Certified, API Specification, ASME Specification, Body, Coating / Finish, End Connection 1, End Connection 2, FM Approved, ISO Specification, MSS Specification, NSF Standard, Stainless Steel Type, UL Listed, Nominal Pipe Size (Fraction), Nominal Pipe Size UOM, Nominal Pipe Size UOM II, Nominal Pipe Size (Decimal) II, Nominal Pipe Size (Decimal) II.UOM, Nominal Pipe Size Dimension II (Fraction), Nominal Size.Dimension 1, Nominal Size.Dimension 1.UOM, Nominal Size.Dimension 2, Nominal Size.Dimension 2.UOM<br>&nbsp;<br>Only some types:<br>• ASTM Specification, AWWA Specification, Body Detail, Finish Detail, NFPA Standard, Potable Water Code, Product Color, Regulatory on (no product type)<br>• Elbow Angle, Nominal Pipe Size UOM III, Nominal Pipe Size (Decimal) III, Nominal Pipe Size (Decimal) III.UOM, Nominal Pipe Size Dimension III (Fraction), Nominal Size.Dimension 3, Nominal Size.Dimension 3.UOM on N/A | Open until the type is split. These rows have no reserved columns. Show a column only when the cell is filled. A new Reliable row is not placed in this group. |
| Product types that cover more than one kind of product | Connector; Flange Fit Gasket Ring; Outlet; Threaded Coupling; Wall Plate; Welded Coupling | Filled columns: Body, Coating / Finish, Nominal Pipe Size (Fraction), Nominal Pipe Size UOM, Nominal Size.Dimension 1, Nominal Size.Dimension 1.UOM<br>&nbsp;<br>Only some types:<br>• Body Detail on Connector, Outlet, Threaded Coupling<br>• Elbow Angle on Connector, Outlet<br>• End Connection 1, End Connection 2, Stainless Steel Type on Connector, Outlet, Threaded Coupling, Welded Coupling<br>• FM Approved, Regulatory, UL Listed, Nominal Pipe Size UOM II on Connector, Flange Fit Gasket Ring, Outlet, Threaded Coupling<br>• Nominal Pipe Size (Decimal) II, Nominal Pipe Size (Decimal) II.UOM, Nominal Pipe Size Dimension II (Fraction), Nominal Size.Dimension 2, Nominal Size.Dimension 2.UOM on Connector, Flange Fit Gasket Ring, Outlet, Threaded Coupling, Wall Plate<br>• ANSI Certified on Flange Fit Gasket Ring, Outlet<br>• ASTM Specification, MSS Specification on Flange Fit Gasket Ring, Outlet, Threaded Coupling, Welded Coupling<br>• Finish Detail on Flange Fit Gasket Ring, Threaded Coupling, Wall Plate<br>• ASME Specification on Outlet, Threaded Coupling, Welded Coupling<br>• NFPA Standard on Outlet<br>• Product Color on Outlet, Threaded Coupling<br>• API Specification, AWWA Specification, ISO Specification, NSF Standard on Threaded Coupling | Open until the type is split. These rows have no reserved columns. Show a column only when the cell is filled.<br>Wall Plate mixes standpipe plates and sprinkler accessories. |

## Columns we leave out

A column can be added back to a group when a product will use it.

| What we leave out | Why it stays off the page |
| --- | --- |
| Dimension A through Z, the valve-material list, Actual Size / O.D., schedule, class, and the pressure and temperature columns | No product values, so there is no pressure rating. Actual Size / O.D. is not a size. Filling these columns would repeat a size the page already shows. The Syndigo export no longer contains Dimension A through Z. Those columns stay on this list. |
| Installation Instructions, Main Category, End Level Web Classification, Product Category | No product values. Product Category is a Syndigo label, not a level of the catalog tree. |
| Web Classification Level 1 through Level 5 | No product values. The breadcrumb uses Web Classification. |
| Height, Width, Length, their units, Weight UOM, Pipe Size | No product values. Weight UOM is empty apart from one placeholder, and it is not the weight unit. |
| Twenty columns that reuse a product-type name, including Hex Nut, Gasket, and Bolt | No value. They are empty attributes, not the product types of those names. |
| 250 further columns | Empty attribute columns, such as bolt size, thread size, end-to-end length, load capacity, and Cv. No product value on any row. |
| Product Code, Product Code Description | Stored with the record fields. The SKU is already the item number. |
| Inner box, master, and pallet quantity, weight, and size, and their units | Warehouse shipping fields. The values stay stored. Syndigo repeats the unit columns, and the second copy is empty. Pack quantity can be added back if the page should show how the SKU ships. |
| 24 record fields, including Type, ID, the audit fields, the publish flags, M3 Item Status, Product Status, Price Sheet ID, and Export Assistance | Record fields, not product attributes. Type is the API fetch filter, type: 'product'. It is not shown in the UI. M3 Item Status and Product Status stay as two record fields. There is no column named Item Status. The Syndigo export no longer contains Export Assistance. It stays on this list. |
| CAD Drawing, Assembly Drawing, Certificate, Engineering Spec, and the Reliable bulletin | Handled by the content file manager. The Reliable bulletin is a file, and it is not a new PIM column. |

The lists below are the Syndigo columns in each of those groups.

## No product value

These columns have no product value on any row. There is no pressure rating. Actual Size / O.D. is not a size. Filling a size or a length column here would repeat a size the page already shows.

### Dimension A through Z

The Syndigo export no longer contains these columns. They stay listed so the next export can be compared. The same letter is not the same measurement on every part, so a picture is not typed into these columns.

- Dimension A
- Dimension B
- Dimension C
- Dimension D
- Dimension E
- Dimension F
- Dimension G
- Dimension H
- Dimension I
- Dimension J
- Dimension K
- Dimension L
- Dimension M
- Dimension N
- Dimension O
- Dimension P
- Dimension Q
- Dimension R
- Dimension S
- Dimension T
- Dimension U
- Dimension V
- Dimension W
- Dimension X
- Dimension Y
- Dimension Z

### Valve materials

- Valve Ball Material
- Valve Belleville Washer Material
- Valve Blushing Material
- Valve Body Material
- Valve Body Seal Material
- Valve Disc Material
- Valve Grand Flange Material
- Valve Handle Assy Material
- Valve Handle Material
- Valve Handle Nut Material
- Valve Hinge Pin Material
- Valve Lock Bolt Material
- Valve Lock Plate Material
- Valve Packing Bolt Material
- Valve Packing Nut Material
- Valve Packing Set Material
- Valve PIN Material
- Valve Retainer Material
- Valve Retaining Ring Material
- Valve Seal Ring Material
- Valve Seat Material
- Valve Spring Material
- Valve Spring Washer Material
- Valve Stem Bushing Material
- Valve Stem Material
- Valve Stem Packaging Material
- Valve Stop Bolt Material
- Valve Stop Plate Material
- Valve Stud Bolt Material
- Valve Tailpiece Material
- Valve Thrust Washer Material
- Valve Union Nut Material
- Valve Union Seal Material

### Actual Size / O.D.

- Actual Size / O.D..Dimension 1
- Actual Size / O.D..Dimension 1.UOM
- Actual Size / O.D..Dimension 2
- Actual Size / O.D..Dimension 2.UOM
- Actual Size / O.D..Dimension 3
- Actual Size / O.D..Dimension 3.UOM

### Schedule, class, pressure, and temperature

- Schedule
- Class
- Pressure Class
- Cold Working Pressure
- Cold Working Pressure.UOM
- Maximum Pressure
- Minimum Pressure
- Maximum Temperature (°C)
- Maximum Temperature (°F)
- Minimum Temperature (°C)
- Minimum Temperature (°F)
- Minimum Operating Temperature
- Minimum Operating Temperature.UOM

### Labels that are not catalog levels

Product Category is a Syndigo label, not a level of the catalog tree. The breadcrumb uses Web Classification.

- Installation Instructions
- Main Category
- End Level Web Classification
- Product Category

### Web Classification levels

- Web Classification Level 1
- Web Classification Level 2
- Web Classification Level 3
- Web Classification Level 4
- Web Classification Level 5

### Empty size and weight columns

- Height
- Height.UOM
- Width
- Width.UOM
- Length
- Length.UOM
- Weight UOM
- Pipe Size

### Columns that reuse a product-type name

These are empty attributes. They are not the product types of those names.

- Hex Nut
- Gasket
- Bolt
- Operator
- Nut
- Handle
- Spring
- Stem
- Seat
- Seal
- Ball
- Piston
- Cap
- Plug
- Cover
- Q
- Washer
- Wedge
- Bushing
- Packing

### 250 further columns

These are the remaining empty attribute columns, such as bolt size, thread size, end-to-end length, load capacity, and Cv.

- Action
- Nominal Size.Action
- Product Attributes Validation Status
- Project Engineer
- Gasket Type
- CV Factor
- Kit?
- Nominal Outer Diameter
- Internal Vendor ID
- Nominal Inner Diameter
- Valve Retainer Seal
- Valve Body Cap
- Max Operating Torque
- Minimum Wall Thickness
- Gasket Material
- ISO Pattern
- Product Photography - Low Resolution
- Universal Code
- Product Model
- Bolt Size
- Bolt Size.UOM
- Housing
- Bolt Quantity
- Hardware Kits
- Logo
- Packaging Code
- Product Line Art
- Lubrication
- Bolt Length
- Bolt Length.UOM
- End-to-End
- End-to-End.UOM
- Maximum End Load
- Maximum End Load.UOM
- Depth
- Depth.UOM
- Load Capacity
- Load Capacity.UOM
- Thread Size
- Thread Size.UOM
- Maximum Load Down
- Maximum Load Down.UOM
- Thread Length
- Thread Length.UOM
- Valve Center to Bottom
- Valve Center to Bottom.UOM
- Belleville Washer
- Handle Sleeve
- Inlet Pipe Size
- Inlet Pipe Size.UOM
- Option Type
- Stem Seal
- Valve Center to Top
- Valve Center to Top.UOM
- Pipe Size.UOM
- Handle Length
- Handle Length.UOM
- Thread Diameter
- Thread Diameter.UOM
- Packing Nut
- Port Type
- Handle Washer
- Valve End To End
- Valve End To End.UOM
- Stop Pin
- Maximum Torque (R-PTFE)
- Maximum Torque (R-PTFE).UOM
- Thrust Washer
- End Piece, Cap, Tailpiece
- Lock Tab
- Gland
- Handle Nut
- Maximum Torque (PEEK)
- Maximum Torque (PEEK).UOM
- Gland Flange
- Take Out
- Take Out.UOM
- Valve Center to Handle Top
- Valve Center to Handle Top.UOM
- Cv Flow Coefficient
- Cv Flow Coefficient.UOM
- Inside Diameter
- Inside Diameter.UOM
- Stop Plate
- Valve Outside Diameter
- Valve Outside Diameter.UOM
- Anti-Static Device - Ball
- Handle Bolt
- Inlet Nipple Length
- Inlet Nipple Length.UOM
- Header
- Total Movement Capability
- Total Movement Capability.UOM
- Flange Thickness
- Flange Thickness.UOM
- Allowable Pipe-End Separation
- Allowable Pipe-End Separation.UOM
- Valve Center to End
- Valve Center to End.UOM
- Pipe Wall Thickness
- Pipe Wall Thickness.UOM
- Stem Set Screw Diameter
- Stem Set Screw Diameter.UOM
- Seat Seal
- Handwheel Diameter
- Handwheel Diameter.UOM
- PCD Diameter
- PCD Diameter.UOM
- Wrench Size
- Wrench Size.UOM
- FM Equivalent Length
- FM Equivalent Length.UOM
- Rod Size
- Rod Size.UOM
- Flow Coefficient (At 90˚ Disc Position)
- Flow Coefficient (At 90˚ Disc Position).UOM
- Center to End
- Center to End.UOM
- Spool Weight
- Spool Weight.UOM
- Cable Size
- Cable Size.UOM
- Cable Diameter
- Cable Diameter.UOM
- Thickness
- Thickness.UOM
- Drain Size
- Drain Size.UOM
- Drain Plug
- Lead Free
- O-Ring
- Flange Step Diameter
- Flange Step Diameter.UOM
- Hole Circle Diameter
- Hole Circle Diameter.UOM
- Secondary End Fitting Body Outside Diameter
- Secondary End Fitting Body Outside Diameter.UOM
- Maximum Specified Torque
- Maximum Specified Torque.UOM
- Bottom Plate Thickness
- Bottom Plate Thickness.UOM
- Mating Flange Bolt Hole Diameter
- Mating Flange Bolt Hole Diameter.UOM
- Bore Diameter
- Bore Diameter.UOM
- Secondary End Outside Diameter
- Secondary End Outside Diameter.UOM
- Flange Step Thickness
- Flange Step Thickness.UOM
- Flange Inner to Inner
- Flange Inner to Inner.UOM
- Flange Diameter
- Flange Diameter.UOM
- Secondary End Female Thread End Depth
- Secondary End Female Thread End Depth.UOM
- Bonnet
- Disc
- T Port Through
- Port Size
- Port Size.UOM
- Flow Data - Friction Loss (Ft. of Pipe)
- Flow Data - Friction Loss (Ft. of Pipe).UOM
- Port Size Bore / Port Size
- Port Size Bore / Port Size.UOM
- Name Plate
- Threads Per Inch
- Valve Center to Stem Top
- Valve Center to Stem Top.UOM
- Deflection from CL of Pipe
- Deflection from CL of Pipe.UOM
- Deflection from CL Per Coupling
- Deflection from CL Per Coupling.UOM
- Load Rating
- Load Rating.UOM
- Strength
- Application Specific
- Application Specific.UOM
- Wall Thickness
- Wall Thickness.UOM
- Safety Data Sheet
- Mounting Bolt Size
- Mounting Bolt Size.UOM
- Shaft Seal
- Mounting Pad Thread Size
- Mounting Pad Thread Size.UOM
- Shaft
- Insertion Depth
- Insertion Depth.UOM
- Outside Diameter - Installed
- Outside Diameter - Installed.UOM
- Equivalent Feet of Pipe
- Equivalent Feet of Pipe.UOM
- Braid Length
- Braid Length.UOM
- Outlet Drop Size
- Outlet Drop Size.UOM
- Assembly Length
- Assembly Length.UOM
- Minimum Hole Diameter
- Minimum Hole Diameter.UOM
- Braided Hose
- Center to Connection
- Center to Connection.UOM
- Name Tag
- Top Plate Diameter
- Top Plate Diameter.UOM
- Outlet Drop Length
- Outlet Drop Length.UOM
- Minimum Bend Radius
- Minimum Bend Radius.UOM
- Wrench Block
- Lock Washer
- Anti-Static Device - Spring
- Thrust Bearing
- Handle Lever
- Flag Indicator
- Stem Bushing
- Spacer Seal
- Stem Cover
- Telescoping Barrel
- Component For
- Component For.UOM
- Stem Bolt
- Stem Double D Width
- Stem Double D Width.UOM
- Wheel Nut
- Gland Packing
- Maximum Load at 650 °F
- Maximum Load at 650 °F.UOM
- Maximum Load Up
- Maximum Load Up.UOM
- Maximum Load Side
- Maximum Load Side.UOM
- Maximum Hole Diameter
- Maximum Hole Diameter.UOM
- Videos
- End Seal Material
- Cap Radius
- Cap Radius.UOM
- Cap Top Thickness
- Cap Top Thickness.UOM
- Anchor Size
- Anchor Size.UOM
- Movement Capability
- Movement Capability.UOM
- Bonnet Bolt
- Maximum End Gap
- Maximum End Gap.UOM
- Cap Hole Diameter
- Cap Hole Diameter.UOM

## Stored, and off the catalog page

### Product code

Product Code and Product Code Description stay stored with the record fields. The SKU is already the item number.

### Packaging

Inner box, master, and pallet quantity, weight, and size stay stored. They are warehouse shipping fields. Pack quantity can be added back if the page should show how the SKU ships.

- Inner Box Pack Quantity
- Inner Box Weight
- Inner Box Weight.UOM
- Inner Box Height
- Inner Box Height.UOM
- Inner Box Length
- Inner Box Length.UOM
- Inner Box Width
- Inner Box Width.UOM
- Master Pack Quantity
- Master Weight
- Master Weight.UOM
- Master Height
- Master Height.UOM
- Master Length
- Master Length.UOM
- Master Width
- Master Width.UOM
- Pallet Pack Quantity
- Pallet Weight
- Pallet Weight.UOM
- Pallet Height
- Pallet Height.UOM
- Pallet Length
- Pallet Length.UOM
- Pallet Width
- Pallet Width.UOM

Syndigo repeats 12 unit columns and Type under the same name. The second copy is empty on every row. The first column is the one that can hold a value.

- Inner Box Length.UOM
- Inner Box Width.UOM
- Inner Box Height.UOM
- Inner Box Weight.UOM
- Master Length.UOM
- Master Width.UOM
- Master Height.UOM
- Master Weight.UOM
- Pallet Length.UOM
- Pallet Width.UOM
- Pallet Height.UOM
- Pallet Weight.UOM
- Type

### Record fields

These 24 columns are record fields, not product attributes. Type is the API fetch filter, type: 'product'. It is not shown in the UI. M3 Item Status and Product Status stay as two record fields. There is no column named Item Status.

- Type
- ID
- Created By
- Created Date
- Modified By
- Modified Date
- Property-Created User
- Property-Created Date
- Property-Modified User
- Property-Modified Date
- Property-Originating User
- Exclude from Conga
- Archive Product ?
- M3 Item Status
- Product Status
- Product Archive Status
- Publish Item Indicator
- Publish Price Indicator
- Portal Publish Indicator
- Workflow Status
- Product Manager
- Manufacturer
- Price Sheet ID
- Export Assistance. The Syndigo export no longer contains this column. It stays on this list.

### Drawings and the Reliable bulletin

CAD Drawing, Assembly Drawing, Certificate, and Engineering Spec are handled by the content file manager. The bulletin PDF on a new row is written to Submittal / Data Sheet, which the page already shows. A SKU that already has a submittal link keeps it. The bulletin is not a new PIM column.

## Product types that could be normalized

Product-type names stay spelled as Syndigo stores them. The pairs below stay as two products. The screen shows the stored name. That does not rename the Syndigo type, and it does not copy an empty size column from one type onto the other.

## Pairs that stay separate

Each pair is two product types, filled on different size columns. They stay in the groups named here. Both stored names stay, and each type keeps the size columns it has today. The screen shows the stored name. A later change to the words on the page does not change the stored value or the columns. An empty size column is not copied from one type onto the other.

| Product type | Group today | How the size is filled |
| --- | --- | --- |
| Check Valve | Commercial and industrial valves | 170 variants. FPPI, Gruvlok, Kennedy Valve, and SCI. The size is a port size, with End Connection 1, End Connection 2, and Body. |
| Check Valves | Reliable valves, risers, and controls | 135 variants. Reliable. The size is Valve Size and the pipe-size decimal, with Valve End Connection, Valve Type, and Trim Type. |
| Pressure Relief Valve | Commercial and industrial valves | One FPPI row. The size is the fraction and Nominal Size.Dimension 1. |
| Relief Valves | Reliable valves, risers, and controls | 22 Reliable variants. The size is the pipe-size decimal. Valve Size is empty. |
| Test and Drain | Commercial and industrial valves | Six FPPI accessory rows. The size is the fraction and Nominal Size.Dimension 1. |
| Test & Drain Valves | Reliable valves, risers, and controls | 127 Reliable variants. The size is the pipe-size decimal, plus Riser Size, Riser Drain Valve, Riser Pressure Relief, and Riser Waterflow Detector. |
| Repair Kit | Valve parts and kits | 684 variants. Sharpe, Quadrant, and SCI. The size is a port size, with ends and a body. |
| Valve Repair Kits | Reliable valves, risers, and controls | 20 Reliable variants. The size is the pipe-size decimal for the valve the kit fits. Riser columns are not used. |

## Names that already share a group

These headings differ by spelling, a missing letter, or a character that did not export. Each pair already uses the same columns. The stored names stay until Syndigo corrects the heading.

| Product types | Group today |
| --- | --- |
| Pipe Nipple; Pipe Nipples | Two-opening fittings |
| Clevis Hanger; ClevisHanger | Hangers, strut, and supports |
| Welded Attachment; Welded Structural Attchment | Hangers, strut, and supports. The second heading omits a letter. |
| Digital (smart) Valve Postioner; Digital Valve Postioner; Electro-pneumatic Valve Postioner; Electropneumatic Valve Postioner; Pneumatic Valve Positioner | Actuators and solenoids. Four headings spell Positioner as Postioner. |
| FlexHead® Hose; FlexHead� Hose | Flexible drops and hose. The odd character is the registered mark, which did not export. |
| SuperFlex® Hose; SuperFlex� Hose | Flexible drops and hose. The odd character is the registered mark, which did not export. |
| Ultra SprinkFlex® Hose; Ultra SprinkFlex® Component; Ultra SprinkFlex� Component; Ultra-SprinkFlex Hoses & Components | Flexible drops and hose. The odd character is the registered mark, which did not export. |

## Names that stay apart

A shared word is not the same product.

- Cap is a pipe end. Breakable Cap and Cap with Chain are standpipe equipment.
- Plug is a pipe end. Plug with Chain is standpipe equipment.
- Tee Strainer is one row. It sits in Strainers and diffusers. Strainer is the strainer type.
- Escutcheons is one Reliable cover plate. The trim escutcheons, canopies, and guards use a connection size, a material, and a finish.
- Wall Plate mixes standpipe plates and sprinkler accessories. It stays open until that type is split.
- Pressure Gauge is one unbranded accessory. Pressure Gauges is the Reliable gauge. Both already sit with the gauges, and neither uses Valve Size.

## Decisions

- The 20 groups stay. The groups, product types, and columns in the table are the fields to show.
- Each group shows its full attribute list. Empty attributes stay hidden. The variant table shows the SKU, the variant name, and up to five differences. The selected SKU shows the rest.
- Single-opening ends are products with one opening. Two-opening fittings are products with two openings. Multi-opening fittings are products with three or more openings, including tees and crosses.
- The five Quadrant actuators typed Anodized stay under Actuators and solenoids. Tee Strainer is in Strainers and diffusers. Fire Hose & Accessories stays under Tools.
- Rows with no product type, rows typed N/A, and the six mixed types stay open. They do not hold up the rest.
- Elbow Angle stays visible on fittings and on hangers and supports. It stays hidden on valves and actuators, and it stays hidden, even when the cell is filled, on Hanger Rod, Washer, FlexHead® Hose, SprinkFlex® Hose, SprinkFlex® Sprinkler Reducer, SuperFlex® Hose, Ultra SprinkFlex® Hose, Expansion Tank, Siamese FDC Double Clapper, and Repair Kit, until Lauren verifies the filled values. The stored values stay.
- Bushing, Concentric Reducer, Eccentric Reducer, and Reducer are in Two-opening fittings. Size 3 stays on those types and is shown where it is populated. Reducer keeps Elbow Angle when the row has no degree. Tees and crosses stay in Multi-opening fittings.
- Check Valve and Check Valves, Pressure Relief Valve and Relief Valves, Test and Drain and Test & Drain Valves, and Repair Kit and Valve Repair Kits stay in the groups above. Both stored names stay, and each type keeps the columns it has today. The screen shows the stored name. An empty size column is not copied from one type onto the other.
- On the page line labeled End Connection, `Gr/Gr` becomes `Grooved`. Every other short code on that line is replaced with the full value already used on End Connection 1 and End Connection 2. Where that line has no end value, it stays blank. A value that already says `Grooved SCH10`, or `Grooved SCH40`, stays as written. No new column is added. End Connection 1 and End Connection 2 are not changed again.
