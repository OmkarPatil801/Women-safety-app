// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $UsersTable extends Users with TableInfo<$UsersTable, User>{
@override final GeneratedDatabase attachedDatabase;
final String? _alias;
$UsersTable(this.attachedDatabase, [this._alias]);
static const VerificationMeta _idMeta = const VerificationMeta('id');
@override
late final GeneratedColumn<int> id = GeneratedColumn<int>('id', aliasedName, false, hasAutoIncrement: true, type: DriftSqlType.int, requiredDuringInsert: false, defaultConstraints: GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
static const VerificationMeta _nameMeta = const VerificationMeta('name');
@override
late final GeneratedColumn<String> name = GeneratedColumn<String>('name', aliasedName, false, type: DriftSqlType.string, requiredDuringInsert: true);
static const VerificationMeta _phoneMeta = const VerificationMeta('phone');
@override
late final GeneratedColumn<String> phone = GeneratedColumn<String>('phone', aliasedName, false, type: DriftSqlType.string, requiredDuringInsert: true);
static const VerificationMeta _emailMeta = const VerificationMeta('email');
@override
late final GeneratedColumn<String> email = GeneratedColumn<String>('email', aliasedName, true, type: DriftSqlType.string, requiredDuringInsert: false);
static const VerificationMeta _createdAtMeta = const VerificationMeta('createdAt');
@override
late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>('created_at', aliasedName, false, type: DriftSqlType.dateTime, requiredDuringInsert: false, defaultValue: currentDateAndTime);
@override
List<GeneratedColumn> get $columns => [id, name, phone, email, createdAt];
@override
String get aliasedName => _alias ?? actualTableName;
@override
 String get actualTableName => $name;
static const String $name = 'users';
@override
VerificationContext validateIntegrity(Insertable<User> instance, {bool isInserting = false}) {
final context = VerificationContext();
final data = instance.toColumns(true);
if (data.containsKey('id')) {
context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));}if (data.containsKey('name')) {
context.handle(_nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));} else if (isInserting) {
context.missing(_nameMeta);
}
if (data.containsKey('phone')) {
context.handle(_phoneMeta, phone.isAcceptableOrUnknown(data['phone']!, _phoneMeta));} else if (isInserting) {
context.missing(_phoneMeta);
}
if (data.containsKey('email')) {
context.handle(_emailMeta, email.isAcceptableOrUnknown(data['email']!, _emailMeta));}if (data.containsKey('created_at')) {
context.handle(_createdAtMeta, createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));}return context;
}
@override
Set<GeneratedColumn> get $primaryKey => {id};
@override User map(Map<String, dynamic> data, {String? tablePrefix})  {
final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';return User(id: attachedDatabase.typeMapping.read(DriftSqlType.int, data['${effectivePrefix}id'])!, name: attachedDatabase.typeMapping.read(DriftSqlType.string, data['${effectivePrefix}name'])!, phone: attachedDatabase.typeMapping.read(DriftSqlType.string, data['${effectivePrefix}phone'])!, email: attachedDatabase.typeMapping.read(DriftSqlType.string, data['${effectivePrefix}email']), createdAt: attachedDatabase.typeMapping.read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!, );
}
@override
$UsersTable createAlias(String alias) {
return $UsersTable(attachedDatabase, alias);}}class User extends DataClass implements Insertable<User> 
{
/// Local auto-incrementing primary key.
final int id;
/// The user's display name.
final String name;
/// The user's phone number.
final String phone;
/// The user's email address. Nullable — nothing in the app currently
/// collects an email (login only uses phone), so requiring one here
/// would make every current code path that creates a [User] invalid.
final String? email;
/// When this local record was created.
final DateTime createdAt;
const User({required this.id, required this.name, required this.phone, this.email, required this.createdAt});@override
Map<String, Expression> toColumns(bool nullToAbsent) {
final map = <String, Expression> {};map['id'] = Variable<int>(id);
map['name'] = Variable<String>(name);
map['phone'] = Variable<String>(phone);
if (!nullToAbsent || email != null){map['email'] = Variable<String>(email);
}map['created_at'] = Variable<DateTime>(createdAt);
return map; 
}
UsersCompanion toCompanion(bool nullToAbsent) {
return UsersCompanion(id: Value(id),name: Value(name),phone: Value(phone),email: email == null && nullToAbsent ? const Value.absent() : Value(email),createdAt: Value(createdAt),);
}
factory User.fromJson(Map<String, dynamic> json, {ValueSerializer? serializer}) {
serializer ??= driftRuntimeOptions.defaultSerializer;
return User(id: serializer.fromJson<int>(json['id']),name: serializer.fromJson<String>(json['name']),phone: serializer.fromJson<String>(json['phone']),email: serializer.fromJson<String?>(json['email']),createdAt: serializer.fromJson<DateTime>(json['createdAt']),);}
@override Map<String, dynamic> toJson({ValueSerializer? serializer}) {
serializer ??= driftRuntimeOptions.defaultSerializer;
return <String, dynamic>{
'id': serializer.toJson<int>(id),'name': serializer.toJson<String>(name),'phone': serializer.toJson<String>(phone),'email': serializer.toJson<String?>(email),'createdAt': serializer.toJson<DateTime>(createdAt),};}User copyWith({int? id,String? name,String? phone,Value<String?> email = const Value.absent(),DateTime? createdAt}) => User(id: id ?? this.id,name: name ?? this.name,phone: phone ?? this.phone,email: email.present ? email.value : this.email,createdAt: createdAt ?? this.createdAt,);User copyWithCompanion(UsersCompanion data) {
return User(
id: data.id.present ? data.id.value : this.id,name: data.name.present ? data.name.value : this.name,phone: data.phone.present ? data.phone.value : this.phone,email: data.email.present ? data.email.value : this.email,createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,);
}
@override
String toString() {return (StringBuffer('User(')..write('id: $id, ')..write('name: $name, ')..write('phone: $phone, ')..write('email: $email, ')..write('createdAt: $createdAt')..write(')')).toString();}
@override
 int get hashCode => Object.hash(id, name, phone, email, createdAt);@override
bool operator ==(Object other) => identical(this, other) || (other is User && other.id == this.id && other.name == this.name && other.phone == this.phone && other.email == this.email && other.createdAt == this.createdAt);
}class UsersCompanion extends UpdateCompanion<User> {
final Value<int> id;
final Value<String> name;
final Value<String> phone;
final Value<String?> email;
final Value<DateTime> createdAt;
const UsersCompanion({this.id = const Value.absent(),this.name = const Value.absent(),this.phone = const Value.absent(),this.email = const Value.absent(),this.createdAt = const Value.absent(),});
UsersCompanion.insert({this.id = const Value.absent(),required String name,required String phone,this.email = const Value.absent(),this.createdAt = const Value.absent(),}): name = Value(name), phone = Value(phone);
static Insertable<User> custom({Expression<int>? id, 
Expression<String>? name, 
Expression<String>? phone, 
Expression<String>? email, 
Expression<DateTime>? createdAt, 
}) {
return RawValuesInsertable({if (id != null)'id': id,if (name != null)'name': name,if (phone != null)'phone': phone,if (email != null)'email': email,if (createdAt != null)'created_at': createdAt,});
}UsersCompanion copyWith({Value<int>? id, Value<String>? name, Value<String>? phone, Value<String?>? email, Value<DateTime>? createdAt}) {
return UsersCompanion(id: id ?? this.id,name: name ?? this.name,phone: phone ?? this.phone,email: email ?? this.email,createdAt: createdAt ?? this.createdAt,);
}
@override
Map<String, Expression> toColumns(bool nullToAbsent) {
final map = <String, Expression> {};if (id.present) {
map['id'] = Variable<int>(id.value);}
if (name.present) {
map['name'] = Variable<String>(name.value);}
if (phone.present) {
map['phone'] = Variable<String>(phone.value);}
if (email.present) {
map['email'] = Variable<String>(email.value);}
if (createdAt.present) {
map['created_at'] = Variable<DateTime>(createdAt.value);}
return map; 
}
@override
String toString() {return (StringBuffer('UsersCompanion(')..write('id: $id, ')..write('name: $name, ')..write('phone: $phone, ')..write('email: $email, ')..write('createdAt: $createdAt')..write(')')).toString();}
}
class $ContactsTable extends Contacts with TableInfo<$ContactsTable, Contact>{
@override final GeneratedDatabase attachedDatabase;
final String? _alias;
$ContactsTable(this.attachedDatabase, [this._alias]);
static const VerificationMeta _idMeta = const VerificationMeta('id');
@override
late final GeneratedColumn<int> id = GeneratedColumn<int>('id', aliasedName, false, hasAutoIncrement: true, type: DriftSqlType.int, requiredDuringInsert: false, defaultConstraints: GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
static const VerificationMeta _nameMeta = const VerificationMeta('name');
@override
late final GeneratedColumn<String> name = GeneratedColumn<String>('name', aliasedName, false, type: DriftSqlType.string, requiredDuringInsert: true);
static const VerificationMeta _phoneMeta = const VerificationMeta('phone');
@override
late final GeneratedColumn<String> phone = GeneratedColumn<String>('phone', aliasedName, false, type: DriftSqlType.string, requiredDuringInsert: true);
static const VerificationMeta _relationshipMeta = const VerificationMeta('relationship');
@override
late final GeneratedColumn<String> relationship = GeneratedColumn<String>('relationship', aliasedName, true, type: DriftSqlType.string, requiredDuringInsert: false);
static const VerificationMeta _isPrimaryMeta = const VerificationMeta('isPrimary');
@override
late final GeneratedColumn<bool> isPrimary = GeneratedColumn<bool>('is_primary', aliasedName, false, type: DriftSqlType.bool, requiredDuringInsert: false, defaultConstraints: GeneratedColumn.constraintIsAlways('CHECK ("is_primary" IN (0, 1))'), defaultValue: const Constant(false));
@override
List<GeneratedColumn> get $columns => [id, name, phone, relationship, isPrimary];
@override
String get aliasedName => _alias ?? actualTableName;
@override
 String get actualTableName => $name;
static const String $name = 'contacts';
@override
VerificationContext validateIntegrity(Insertable<Contact> instance, {bool isInserting = false}) {
final context = VerificationContext();
final data = instance.toColumns(true);
if (data.containsKey('id')) {
context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));}if (data.containsKey('name')) {
context.handle(_nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));} else if (isInserting) {
context.missing(_nameMeta);
}
if (data.containsKey('phone')) {
context.handle(_phoneMeta, phone.isAcceptableOrUnknown(data['phone']!, _phoneMeta));} else if (isInserting) {
context.missing(_phoneMeta);
}
if (data.containsKey('relationship')) {
context.handle(_relationshipMeta, relationship.isAcceptableOrUnknown(data['relationship']!, _relationshipMeta));}if (data.containsKey('is_primary')) {
context.handle(_isPrimaryMeta, isPrimary.isAcceptableOrUnknown(data['is_primary']!, _isPrimaryMeta));}return context;
}
@override
Set<GeneratedColumn> get $primaryKey => {id};
@override Contact map(Map<String, dynamic> data, {String? tablePrefix})  {
final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';return Contact(id: attachedDatabase.typeMapping.read(DriftSqlType.int, data['${effectivePrefix}id'])!, name: attachedDatabase.typeMapping.read(DriftSqlType.string, data['${effectivePrefix}name'])!, phone: attachedDatabase.typeMapping.read(DriftSqlType.string, data['${effectivePrefix}phone'])!, relationship: attachedDatabase.typeMapping.read(DriftSqlType.string, data['${effectivePrefix}relationship']), isPrimary: attachedDatabase.typeMapping.read(DriftSqlType.bool, data['${effectivePrefix}is_primary'])!, );
}
@override
$ContactsTable createAlias(String alias) {
return $ContactsTable(attachedDatabase, alias);}}class Contact extends DataClass implements Insertable<Contact> 
{
/// Local auto-incrementing primary key.
final int id;
/// The contact's display name.
final String name;
/// The phone number `sendSOS()` will eventually text.
final String phone;
/// Optional label such as "Mother" or "Friend".
final String? relationship;
/// Whether this contact is a Primary Emergency Contact. `sendSOS()`
/// sends only to contacts where this is true — there is no limit on
/// how many contacts can be marked primary. Added in schema version 2
/// (see `AppDatabase.migration`); existing contacts default to false.
final bool isPrimary;
const Contact({required this.id, required this.name, required this.phone, this.relationship, required this.isPrimary});@override
Map<String, Expression> toColumns(bool nullToAbsent) {
final map = <String, Expression> {};map['id'] = Variable<int>(id);
map['name'] = Variable<String>(name);
map['phone'] = Variable<String>(phone);
if (!nullToAbsent || relationship != null){map['relationship'] = Variable<String>(relationship);
}map['is_primary'] = Variable<bool>(isPrimary);
return map; 
}
ContactsCompanion toCompanion(bool nullToAbsent) {
return ContactsCompanion(id: Value(id),name: Value(name),phone: Value(phone),relationship: relationship == null && nullToAbsent ? const Value.absent() : Value(relationship),isPrimary: Value(isPrimary),);
}
factory Contact.fromJson(Map<String, dynamic> json, {ValueSerializer? serializer}) {
serializer ??= driftRuntimeOptions.defaultSerializer;
return Contact(id: serializer.fromJson<int>(json['id']),name: serializer.fromJson<String>(json['name']),phone: serializer.fromJson<String>(json['phone']),relationship: serializer.fromJson<String?>(json['relationship']),isPrimary: serializer.fromJson<bool>(json['isPrimary']),);}
@override Map<String, dynamic> toJson({ValueSerializer? serializer}) {
serializer ??= driftRuntimeOptions.defaultSerializer;
return <String, dynamic>{
'id': serializer.toJson<int>(id),'name': serializer.toJson<String>(name),'phone': serializer.toJson<String>(phone),'relationship': serializer.toJson<String?>(relationship),'isPrimary': serializer.toJson<bool>(isPrimary),};}Contact copyWith({int? id,String? name,String? phone,Value<String?> relationship = const Value.absent(),bool? isPrimary}) => Contact(id: id ?? this.id,name: name ?? this.name,phone: phone ?? this.phone,relationship: relationship.present ? relationship.value : this.relationship,isPrimary: isPrimary ?? this.isPrimary,);Contact copyWithCompanion(ContactsCompanion data) {
return Contact(
id: data.id.present ? data.id.value : this.id,name: data.name.present ? data.name.value : this.name,phone: data.phone.present ? data.phone.value : this.phone,relationship: data.relationship.present ? data.relationship.value : this.relationship,isPrimary: data.isPrimary.present ? data.isPrimary.value : this.isPrimary,);
}
@override
String toString() {return (StringBuffer('Contact(')..write('id: $id, ')..write('name: $name, ')..write('phone: $phone, ')..write('relationship: $relationship, ')..write('isPrimary: $isPrimary')..write(')')).toString();}
@override
 int get hashCode => Object.hash(id, name, phone, relationship, isPrimary);@override
bool operator ==(Object other) => identical(this, other) || (other is Contact && other.id == this.id && other.name == this.name && other.phone == this.phone && other.relationship == this.relationship && other.isPrimary == this.isPrimary);
}class ContactsCompanion extends UpdateCompanion<Contact> {
final Value<int> id;
final Value<String> name;
final Value<String> phone;
final Value<String?> relationship;
final Value<bool> isPrimary;
const ContactsCompanion({this.id = const Value.absent(),this.name = const Value.absent(),this.phone = const Value.absent(),this.relationship = const Value.absent(),this.isPrimary = const Value.absent(),});
ContactsCompanion.insert({this.id = const Value.absent(),required String name,required String phone,this.relationship = const Value.absent(),this.isPrimary = const Value.absent(),}): name = Value(name), phone = Value(phone);
static Insertable<Contact> custom({Expression<int>? id, 
Expression<String>? name, 
Expression<String>? phone, 
Expression<String>? relationship, 
Expression<bool>? isPrimary, 
}) {
return RawValuesInsertable({if (id != null)'id': id,if (name != null)'name': name,if (phone != null)'phone': phone,if (relationship != null)'relationship': relationship,if (isPrimary != null)'is_primary': isPrimary,});
}ContactsCompanion copyWith({Value<int>? id, Value<String>? name, Value<String>? phone, Value<String?>? relationship, Value<bool>? isPrimary}) {
return ContactsCompanion(id: id ?? this.id,name: name ?? this.name,phone: phone ?? this.phone,relationship: relationship ?? this.relationship,isPrimary: isPrimary ?? this.isPrimary,);
}
@override
Map<String, Expression> toColumns(bool nullToAbsent) {
final map = <String, Expression> {};if (id.present) {
map['id'] = Variable<int>(id.value);}
if (name.present) {
map['name'] = Variable<String>(name.value);}
if (phone.present) {
map['phone'] = Variable<String>(phone.value);}
if (relationship.present) {
map['relationship'] = Variable<String>(relationship.value);}
if (isPrimary.present) {
map['is_primary'] = Variable<bool>(isPrimary.value);}
return map; 
}
@override
String toString() {return (StringBuffer('ContactsCompanion(')..write('id: $id, ')..write('name: $name, ')..write('phone: $phone, ')..write('relationship: $relationship, ')..write('isPrimary: $isPrimary')..write(')')).toString();}
}
class $ReportsTable extends Reports with TableInfo<$ReportsTable, Report>{
@override final GeneratedDatabase attachedDatabase;
final String? _alias;
$ReportsTable(this.attachedDatabase, [this._alias]);
static const VerificationMeta _idMeta = const VerificationMeta('id');
@override
late final GeneratedColumn<int> id = GeneratedColumn<int>('id', aliasedName, false, hasAutoIncrement: true, type: DriftSqlType.int, requiredDuringInsert: false, defaultConstraints: GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
static const VerificationMeta _latitudeMeta = const VerificationMeta('latitude');
@override
late final GeneratedColumn<double> latitude = GeneratedColumn<double>('latitude', aliasedName, false, type: DriftSqlType.double, requiredDuringInsert: true);
static const VerificationMeta _longitudeMeta = const VerificationMeta('longitude');
@override
late final GeneratedColumn<double> longitude = GeneratedColumn<double>('longitude', aliasedName, false, type: DriftSqlType.double, requiredDuringInsert: true);
static const VerificationMeta _descriptionMeta = const VerificationMeta('description');
@override
late final GeneratedColumn<String> description = GeneratedColumn<String>('description', aliasedName, true, type: DriftSqlType.string, requiredDuringInsert: false);
static const VerificationMeta _categoryMeta = const VerificationMeta('category');
@override
late final GeneratedColumn<String> category = GeneratedColumn<String>('category', aliasedName, false, type: DriftSqlType.string, requiredDuringInsert: true);
static const VerificationMeta _severityMeta = const VerificationMeta('severity');
@override
late final GeneratedColumn<String> severity = GeneratedColumn<String>('severity', aliasedName, false, type: DriftSqlType.string, requiredDuringInsert: true);
static const VerificationMeta _imagePathMeta = const VerificationMeta('imagePath');
@override
late final GeneratedColumn<String> imagePath = GeneratedColumn<String>('image_path', aliasedName, true, type: DriftSqlType.string, requiredDuringInsert: false);
static const VerificationMeta _syncedMeta = const VerificationMeta('synced');
@override
late final GeneratedColumn<bool> synced = GeneratedColumn<bool>('synced', aliasedName, false, type: DriftSqlType.bool, requiredDuringInsert: false, defaultConstraints: GeneratedColumn.constraintIsAlways('CHECK ("synced" IN (0, 1))'), defaultValue: const Constant(false));
static const VerificationMeta _timestampMeta = const VerificationMeta('timestamp');
@override
late final GeneratedColumn<DateTime> timestamp = GeneratedColumn<DateTime>('timestamp', aliasedName, false, type: DriftSqlType.dateTime, requiredDuringInsert: false, defaultValue: currentDateAndTime);
@override
List<GeneratedColumn> get $columns => [id, latitude, longitude, description, category, severity, imagePath, synced, timestamp];
@override
String get aliasedName => _alias ?? actualTableName;
@override
 String get actualTableName => $name;
static const String $name = 'reports';
@override
VerificationContext validateIntegrity(Insertable<Report> instance, {bool isInserting = false}) {
final context = VerificationContext();
final data = instance.toColumns(true);
if (data.containsKey('id')) {
context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));}if (data.containsKey('latitude')) {
context.handle(_latitudeMeta, latitude.isAcceptableOrUnknown(data['latitude']!, _latitudeMeta));} else if (isInserting) {
context.missing(_latitudeMeta);
}
if (data.containsKey('longitude')) {
context.handle(_longitudeMeta, longitude.isAcceptableOrUnknown(data['longitude']!, _longitudeMeta));} else if (isInserting) {
context.missing(_longitudeMeta);
}
if (data.containsKey('description')) {
context.handle(_descriptionMeta, description.isAcceptableOrUnknown(data['description']!, _descriptionMeta));}if (data.containsKey('category')) {
context.handle(_categoryMeta, category.isAcceptableOrUnknown(data['category']!, _categoryMeta));} else if (isInserting) {
context.missing(_categoryMeta);
}
if (data.containsKey('severity')) {
context.handle(_severityMeta, severity.isAcceptableOrUnknown(data['severity']!, _severityMeta));} else if (isInserting) {
context.missing(_severityMeta);
}
if (data.containsKey('image_path')) {
context.handle(_imagePathMeta, imagePath.isAcceptableOrUnknown(data['image_path']!, _imagePathMeta));}if (data.containsKey('synced')) {
context.handle(_syncedMeta, synced.isAcceptableOrUnknown(data['synced']!, _syncedMeta));}if (data.containsKey('timestamp')) {
context.handle(_timestampMeta, timestamp.isAcceptableOrUnknown(data['timestamp']!, _timestampMeta));}return context;
}
@override
Set<GeneratedColumn> get $primaryKey => {id};
@override Report map(Map<String, dynamic> data, {String? tablePrefix})  {
final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';return Report(id: attachedDatabase.typeMapping.read(DriftSqlType.int, data['${effectivePrefix}id'])!, latitude: attachedDatabase.typeMapping.read(DriftSqlType.double, data['${effectivePrefix}latitude'])!, longitude: attachedDatabase.typeMapping.read(DriftSqlType.double, data['${effectivePrefix}longitude'])!, description: attachedDatabase.typeMapping.read(DriftSqlType.string, data['${effectivePrefix}description']), category: attachedDatabase.typeMapping.read(DriftSqlType.string, data['${effectivePrefix}category'])!, severity: attachedDatabase.typeMapping.read(DriftSqlType.string, data['${effectivePrefix}severity'])!, imagePath: attachedDatabase.typeMapping.read(DriftSqlType.string, data['${effectivePrefix}image_path']), synced: attachedDatabase.typeMapping.read(DriftSqlType.bool, data['${effectivePrefix}synced'])!, timestamp: attachedDatabase.typeMapping.read(DriftSqlType.dateTime, data['${effectivePrefix}timestamp'])!, );
}
@override
$ReportsTable createAlias(String alias) {
return $ReportsTable(attachedDatabase, alias);}}class Report extends DataClass implements Insertable<Report> 
{
/// Local auto-incrementing primary key.
final int id;
/// Latitude of the reported location.
final double latitude;
/// Longitude of the reported location.
final double longitude;
/// Optional free-text detail about the incident.
final String? description;
/// The incident category (e.g. "harassment", "poor lighting"). Kept as
/// plain text rather than an enum — the category taxonomy isn't
/// finalized anywhere in the project yet.
final String category;
/// The incident severity. Kept as plain text for the same reason as
/// [category] — no fixed taxonomy has been decided yet.
final String severity;
/// Path to an attached photo, if any. Nullable — not every report has
/// one.
final String? imagePath;
/// Whether this report has been pushed to Firebase yet.
final bool synced;
/// When this report was submitted.
final DateTime timestamp;
const Report({required this.id, required this.latitude, required this.longitude, this.description, required this.category, required this.severity, this.imagePath, required this.synced, required this.timestamp});@override
Map<String, Expression> toColumns(bool nullToAbsent) {
final map = <String, Expression> {};map['id'] = Variable<int>(id);
map['latitude'] = Variable<double>(latitude);
map['longitude'] = Variable<double>(longitude);
if (!nullToAbsent || description != null){map['description'] = Variable<String>(description);
}map['category'] = Variable<String>(category);
map['severity'] = Variable<String>(severity);
if (!nullToAbsent || imagePath != null){map['image_path'] = Variable<String>(imagePath);
}map['synced'] = Variable<bool>(synced);
map['timestamp'] = Variable<DateTime>(timestamp);
return map; 
}
ReportsCompanion toCompanion(bool nullToAbsent) {
return ReportsCompanion(id: Value(id),latitude: Value(latitude),longitude: Value(longitude),description: description == null && nullToAbsent ? const Value.absent() : Value(description),category: Value(category),severity: Value(severity),imagePath: imagePath == null && nullToAbsent ? const Value.absent() : Value(imagePath),synced: Value(synced),timestamp: Value(timestamp),);
}
factory Report.fromJson(Map<String, dynamic> json, {ValueSerializer? serializer}) {
serializer ??= driftRuntimeOptions.defaultSerializer;
return Report(id: serializer.fromJson<int>(json['id']),latitude: serializer.fromJson<double>(json['latitude']),longitude: serializer.fromJson<double>(json['longitude']),description: serializer.fromJson<String?>(json['description']),category: serializer.fromJson<String>(json['category']),severity: serializer.fromJson<String>(json['severity']),imagePath: serializer.fromJson<String?>(json['imagePath']),synced: serializer.fromJson<bool>(json['synced']),timestamp: serializer.fromJson<DateTime>(json['timestamp']),);}
@override Map<String, dynamic> toJson({ValueSerializer? serializer}) {
serializer ??= driftRuntimeOptions.defaultSerializer;
return <String, dynamic>{
'id': serializer.toJson<int>(id),'latitude': serializer.toJson<double>(latitude),'longitude': serializer.toJson<double>(longitude),'description': serializer.toJson<String?>(description),'category': serializer.toJson<String>(category),'severity': serializer.toJson<String>(severity),'imagePath': serializer.toJson<String?>(imagePath),'synced': serializer.toJson<bool>(synced),'timestamp': serializer.toJson<DateTime>(timestamp),};}Report copyWith({int? id,double? latitude,double? longitude,Value<String?> description = const Value.absent(),String? category,String? severity,Value<String?> imagePath = const Value.absent(),bool? synced,DateTime? timestamp}) => Report(id: id ?? this.id,latitude: latitude ?? this.latitude,longitude: longitude ?? this.longitude,description: description.present ? description.value : this.description,category: category ?? this.category,severity: severity ?? this.severity,imagePath: imagePath.present ? imagePath.value : this.imagePath,synced: synced ?? this.synced,timestamp: timestamp ?? this.timestamp,);Report copyWithCompanion(ReportsCompanion data) {
return Report(
id: data.id.present ? data.id.value : this.id,latitude: data.latitude.present ? data.latitude.value : this.latitude,longitude: data.longitude.present ? data.longitude.value : this.longitude,description: data.description.present ? data.description.value : this.description,category: data.category.present ? data.category.value : this.category,severity: data.severity.present ? data.severity.value : this.severity,imagePath: data.imagePath.present ? data.imagePath.value : this.imagePath,synced: data.synced.present ? data.synced.value : this.synced,timestamp: data.timestamp.present ? data.timestamp.value : this.timestamp,);
}
@override
String toString() {return (StringBuffer('Report(')..write('id: $id, ')..write('latitude: $latitude, ')..write('longitude: $longitude, ')..write('description: $description, ')..write('category: $category, ')..write('severity: $severity, ')..write('imagePath: $imagePath, ')..write('synced: $synced, ')..write('timestamp: $timestamp')..write(')')).toString();}
@override
 int get hashCode => Object.hash(id, latitude, longitude, description, category, severity, imagePath, synced, timestamp);@override
bool operator ==(Object other) => identical(this, other) || (other is Report && other.id == this.id && other.latitude == this.latitude && other.longitude == this.longitude && other.description == this.description && other.category == this.category && other.severity == this.severity && other.imagePath == this.imagePath && other.synced == this.synced && other.timestamp == this.timestamp);
}class ReportsCompanion extends UpdateCompanion<Report> {
final Value<int> id;
final Value<double> latitude;
final Value<double> longitude;
final Value<String?> description;
final Value<String> category;
final Value<String> severity;
final Value<String?> imagePath;
final Value<bool> synced;
final Value<DateTime> timestamp;
const ReportsCompanion({this.id = const Value.absent(),this.latitude = const Value.absent(),this.longitude = const Value.absent(),this.description = const Value.absent(),this.category = const Value.absent(),this.severity = const Value.absent(),this.imagePath = const Value.absent(),this.synced = const Value.absent(),this.timestamp = const Value.absent(),});
ReportsCompanion.insert({this.id = const Value.absent(),required double latitude,required double longitude,this.description = const Value.absent(),required String category,required String severity,this.imagePath = const Value.absent(),this.synced = const Value.absent(),this.timestamp = const Value.absent(),}): latitude = Value(latitude), longitude = Value(longitude), category = Value(category), severity = Value(severity);
static Insertable<Report> custom({Expression<int>? id, 
Expression<double>? latitude, 
Expression<double>? longitude, 
Expression<String>? description, 
Expression<String>? category, 
Expression<String>? severity, 
Expression<String>? imagePath, 
Expression<bool>? synced, 
Expression<DateTime>? timestamp, 
}) {
return RawValuesInsertable({if (id != null)'id': id,if (latitude != null)'latitude': latitude,if (longitude != null)'longitude': longitude,if (description != null)'description': description,if (category != null)'category': category,if (severity != null)'severity': severity,if (imagePath != null)'image_path': imagePath,if (synced != null)'synced': synced,if (timestamp != null)'timestamp': timestamp,});
}ReportsCompanion copyWith({Value<int>? id, Value<double>? latitude, Value<double>? longitude, Value<String?>? description, Value<String>? category, Value<String>? severity, Value<String?>? imagePath, Value<bool>? synced, Value<DateTime>? timestamp}) {
return ReportsCompanion(id: id ?? this.id,latitude: latitude ?? this.latitude,longitude: longitude ?? this.longitude,description: description ?? this.description,category: category ?? this.category,severity: severity ?? this.severity,imagePath: imagePath ?? this.imagePath,synced: synced ?? this.synced,timestamp: timestamp ?? this.timestamp,);
}
@override
Map<String, Expression> toColumns(bool nullToAbsent) {
final map = <String, Expression> {};if (id.present) {
map['id'] = Variable<int>(id.value);}
if (latitude.present) {
map['latitude'] = Variable<double>(latitude.value);}
if (longitude.present) {
map['longitude'] = Variable<double>(longitude.value);}
if (description.present) {
map['description'] = Variable<String>(description.value);}
if (category.present) {
map['category'] = Variable<String>(category.value);}
if (severity.present) {
map['severity'] = Variable<String>(severity.value);}
if (imagePath.present) {
map['image_path'] = Variable<String>(imagePath.value);}
if (synced.present) {
map['synced'] = Variable<bool>(synced.value);}
if (timestamp.present) {
map['timestamp'] = Variable<DateTime>(timestamp.value);}
return map; 
}
@override
String toString() {return (StringBuffer('ReportsCompanion(')..write('id: $id, ')..write('latitude: $latitude, ')..write('longitude: $longitude, ')..write('description: $description, ')..write('category: $category, ')..write('severity: $severity, ')..write('imagePath: $imagePath, ')..write('synced: $synced, ')..write('timestamp: $timestamp')..write(')')).toString();}
}
class $SosHistoriesTable extends SosHistories with TableInfo<$SosHistoriesTable, SosHistory>{
@override final GeneratedDatabase attachedDatabase;
final String? _alias;
$SosHistoriesTable(this.attachedDatabase, [this._alias]);
static const VerificationMeta _idMeta = const VerificationMeta('id');
@override
late final GeneratedColumn<int> id = GeneratedColumn<int>('id', aliasedName, false, hasAutoIncrement: true, type: DriftSqlType.int, requiredDuringInsert: false, defaultConstraints: GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
static const VerificationMeta _latitudeMeta = const VerificationMeta('latitude');
@override
late final GeneratedColumn<double> latitude = GeneratedColumn<double>('latitude', aliasedName, false, type: DriftSqlType.double, requiredDuringInsert: true);
static const VerificationMeta _longitudeMeta = const VerificationMeta('longitude');
@override
late final GeneratedColumn<double> longitude = GeneratedColumn<double>('longitude', aliasedName, false, type: DriftSqlType.double, requiredDuringInsert: true);
static const VerificationMeta _timestampMeta = const VerificationMeta('timestamp');
@override
late final GeneratedColumn<DateTime> timestamp = GeneratedColumn<DateTime>('timestamp', aliasedName, false, type: DriftSqlType.dateTime, requiredDuringInsert: false, defaultValue: currentDateAndTime);
static const VerificationMeta _sentMeta = const VerificationMeta('sent');
@override
late final GeneratedColumn<bool> sent = GeneratedColumn<bool>('sent', aliasedName, false, type: DriftSqlType.bool, requiredDuringInsert: false, defaultConstraints: GeneratedColumn.constraintIsAlways('CHECK ("sent" IN (0, 1))'), defaultValue: const Constant(false));
@override
List<GeneratedColumn> get $columns => [id, latitude, longitude, timestamp, sent];
@override
String get aliasedName => _alias ?? actualTableName;
@override
 String get actualTableName => $name;
static const String $name = 'sos_histories';
@override
VerificationContext validateIntegrity(Insertable<SosHistory> instance, {bool isInserting = false}) {
final context = VerificationContext();
final data = instance.toColumns(true);
if (data.containsKey('id')) {
context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));}if (data.containsKey('latitude')) {
context.handle(_latitudeMeta, latitude.isAcceptableOrUnknown(data['latitude']!, _latitudeMeta));} else if (isInserting) {
context.missing(_latitudeMeta);
}
if (data.containsKey('longitude')) {
context.handle(_longitudeMeta, longitude.isAcceptableOrUnknown(data['longitude']!, _longitudeMeta));} else if (isInserting) {
context.missing(_longitudeMeta);
}
if (data.containsKey('timestamp')) {
context.handle(_timestampMeta, timestamp.isAcceptableOrUnknown(data['timestamp']!, _timestampMeta));}if (data.containsKey('sent')) {
context.handle(_sentMeta, sent.isAcceptableOrUnknown(data['sent']!, _sentMeta));}return context;
}
@override
Set<GeneratedColumn> get $primaryKey => {id};
@override SosHistory map(Map<String, dynamic> data, {String? tablePrefix})  {
final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';return SosHistory(id: attachedDatabase.typeMapping.read(DriftSqlType.int, data['${effectivePrefix}id'])!, latitude: attachedDatabase.typeMapping.read(DriftSqlType.double, data['${effectivePrefix}latitude'])!, longitude: attachedDatabase.typeMapping.read(DriftSqlType.double, data['${effectivePrefix}longitude'])!, timestamp: attachedDatabase.typeMapping.read(DriftSqlType.dateTime, data['${effectivePrefix}timestamp'])!, sent: attachedDatabase.typeMapping.read(DriftSqlType.bool, data['${effectivePrefix}sent'])!, );
}
@override
$SosHistoriesTable createAlias(String alias) {
return $SosHistoriesTable(attachedDatabase, alias);}}class SosHistory extends DataClass implements Insertable<SosHistory> 
{
/// Local auto-incrementing primary key.
final int id;
/// Latitude at the moment SOS was triggered.
final double latitude;
/// Longitude at the moment SOS was triggered.
final double longitude;
/// When SOS was triggered.
final DateTime timestamp;
/// Whether the SOS message was actually sent.
final bool sent;
const SosHistory({required this.id, required this.latitude, required this.longitude, required this.timestamp, required this.sent});@override
Map<String, Expression> toColumns(bool nullToAbsent) {
final map = <String, Expression> {};map['id'] = Variable<int>(id);
map['latitude'] = Variable<double>(latitude);
map['longitude'] = Variable<double>(longitude);
map['timestamp'] = Variable<DateTime>(timestamp);
map['sent'] = Variable<bool>(sent);
return map; 
}
SosHistoriesCompanion toCompanion(bool nullToAbsent) {
return SosHistoriesCompanion(id: Value(id),latitude: Value(latitude),longitude: Value(longitude),timestamp: Value(timestamp),sent: Value(sent),);
}
factory SosHistory.fromJson(Map<String, dynamic> json, {ValueSerializer? serializer}) {
serializer ??= driftRuntimeOptions.defaultSerializer;
return SosHistory(id: serializer.fromJson<int>(json['id']),latitude: serializer.fromJson<double>(json['latitude']),longitude: serializer.fromJson<double>(json['longitude']),timestamp: serializer.fromJson<DateTime>(json['timestamp']),sent: serializer.fromJson<bool>(json['sent']),);}
@override Map<String, dynamic> toJson({ValueSerializer? serializer}) {
serializer ??= driftRuntimeOptions.defaultSerializer;
return <String, dynamic>{
'id': serializer.toJson<int>(id),'latitude': serializer.toJson<double>(latitude),'longitude': serializer.toJson<double>(longitude),'timestamp': serializer.toJson<DateTime>(timestamp),'sent': serializer.toJson<bool>(sent),};}SosHistory copyWith({int? id,double? latitude,double? longitude,DateTime? timestamp,bool? sent}) => SosHistory(id: id ?? this.id,latitude: latitude ?? this.latitude,longitude: longitude ?? this.longitude,timestamp: timestamp ?? this.timestamp,sent: sent ?? this.sent,);SosHistory copyWithCompanion(SosHistoriesCompanion data) {
return SosHistory(
id: data.id.present ? data.id.value : this.id,latitude: data.latitude.present ? data.latitude.value : this.latitude,longitude: data.longitude.present ? data.longitude.value : this.longitude,timestamp: data.timestamp.present ? data.timestamp.value : this.timestamp,sent: data.sent.present ? data.sent.value : this.sent,);
}
@override
String toString() {return (StringBuffer('SosHistory(')..write('id: $id, ')..write('latitude: $latitude, ')..write('longitude: $longitude, ')..write('timestamp: $timestamp, ')..write('sent: $sent')..write(')')).toString();}
@override
 int get hashCode => Object.hash(id, latitude, longitude, timestamp, sent);@override
bool operator ==(Object other) => identical(this, other) || (other is SosHistory && other.id == this.id && other.latitude == this.latitude && other.longitude == this.longitude && other.timestamp == this.timestamp && other.sent == this.sent);
}class SosHistoriesCompanion extends UpdateCompanion<SosHistory> {
final Value<int> id;
final Value<double> latitude;
final Value<double> longitude;
final Value<DateTime> timestamp;
final Value<bool> sent;
const SosHistoriesCompanion({this.id = const Value.absent(),this.latitude = const Value.absent(),this.longitude = const Value.absent(),this.timestamp = const Value.absent(),this.sent = const Value.absent(),});
SosHistoriesCompanion.insert({this.id = const Value.absent(),required double latitude,required double longitude,this.timestamp = const Value.absent(),this.sent = const Value.absent(),}): latitude = Value(latitude), longitude = Value(longitude);
static Insertable<SosHistory> custom({Expression<int>? id, 
Expression<double>? latitude, 
Expression<double>? longitude, 
Expression<DateTime>? timestamp, 
Expression<bool>? sent, 
}) {
return RawValuesInsertable({if (id != null)'id': id,if (latitude != null)'latitude': latitude,if (longitude != null)'longitude': longitude,if (timestamp != null)'timestamp': timestamp,if (sent != null)'sent': sent,});
}SosHistoriesCompanion copyWith({Value<int>? id, Value<double>? latitude, Value<double>? longitude, Value<DateTime>? timestamp, Value<bool>? sent}) {
return SosHistoriesCompanion(id: id ?? this.id,latitude: latitude ?? this.latitude,longitude: longitude ?? this.longitude,timestamp: timestamp ?? this.timestamp,sent: sent ?? this.sent,);
}
@override
Map<String, Expression> toColumns(bool nullToAbsent) {
final map = <String, Expression> {};if (id.present) {
map['id'] = Variable<int>(id.value);}
if (latitude.present) {
map['latitude'] = Variable<double>(latitude.value);}
if (longitude.present) {
map['longitude'] = Variable<double>(longitude.value);}
if (timestamp.present) {
map['timestamp'] = Variable<DateTime>(timestamp.value);}
if (sent.present) {
map['sent'] = Variable<bool>(sent.value);}
return map; 
}
@override
String toString() {return (StringBuffer('SosHistoriesCompanion(')..write('id: $id, ')..write('latitude: $latitude, ')..write('longitude: $longitude, ')..write('timestamp: $timestamp, ')..write('sent: $sent')..write(')')).toString();}
}
class $SettingsTableTable extends SettingsTable with TableInfo<$SettingsTableTable, Settings>{
@override final GeneratedDatabase attachedDatabase;
final String? _alias;
$SettingsTableTable(this.attachedDatabase, [this._alias]);
static const VerificationMeta _idMeta = const VerificationMeta('id');
@override
late final GeneratedColumn<int> id = GeneratedColumn<int>('id', aliasedName, false, hasAutoIncrement: true, type: DriftSqlType.int, requiredDuringInsert: false, defaultConstraints: GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
static const VerificationMeta _darkModeMeta = const VerificationMeta('darkMode');
@override
late final GeneratedColumn<bool> darkMode = GeneratedColumn<bool>('dark_mode', aliasedName, false, type: DriftSqlType.bool, requiredDuringInsert: false, defaultConstraints: GeneratedColumn.constraintIsAlways('CHECK ("dark_mode" IN (0, 1))'), defaultValue: const Constant(true));
static const VerificationMeta _notificationsMeta = const VerificationMeta('notifications');
@override
late final GeneratedColumn<bool> notifications = GeneratedColumn<bool>('notifications', aliasedName, false, type: DriftSqlType.bool, requiredDuringInsert: false, defaultConstraints: GeneratedColumn.constraintIsAlways('CHECK ("notifications" IN (0, 1))'), defaultValue: const Constant(true));
static const VerificationMeta _languageMeta = const VerificationMeta('language');
@override
late final GeneratedColumn<String> language = GeneratedColumn<String>('language', aliasedName, false, type: DriftSqlType.string, requiredDuringInsert: false, defaultValue: const Constant('en'));
@override
List<GeneratedColumn> get $columns => [id, darkMode, notifications, language];
@override
String get aliasedName => _alias ?? actualTableName;
@override
 String get actualTableName => $name;
static const String $name = 'settings_table';
@override
VerificationContext validateIntegrity(Insertable<Settings> instance, {bool isInserting = false}) {
final context = VerificationContext();
final data = instance.toColumns(true);
if (data.containsKey('id')) {
context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));}if (data.containsKey('dark_mode')) {
context.handle(_darkModeMeta, darkMode.isAcceptableOrUnknown(data['dark_mode']!, _darkModeMeta));}if (data.containsKey('notifications')) {
context.handle(_notificationsMeta, notifications.isAcceptableOrUnknown(data['notifications']!, _notificationsMeta));}if (data.containsKey('language')) {
context.handle(_languageMeta, language.isAcceptableOrUnknown(data['language']!, _languageMeta));}return context;
}
@override
Set<GeneratedColumn> get $primaryKey => {id};
@override Settings map(Map<String, dynamic> data, {String? tablePrefix})  {
final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';return Settings(id: attachedDatabase.typeMapping.read(DriftSqlType.int, data['${effectivePrefix}id'])!, darkMode: attachedDatabase.typeMapping.read(DriftSqlType.bool, data['${effectivePrefix}dark_mode'])!, notifications: attachedDatabase.typeMapping.read(DriftSqlType.bool, data['${effectivePrefix}notifications'])!, language: attachedDatabase.typeMapping.read(DriftSqlType.string, data['${effectivePrefix}language'])!, );
}
@override
$SettingsTableTable createAlias(String alias) {
return $SettingsTableTable(attachedDatabase, alias);}}class Settings extends DataClass implements Insertable<Settings> 
{
/// Local auto-incrementing primary key.
final int id;
/// Whether dark mode is enabled. Defaults to true, matching the app's
/// current always-dark theme — no light theme exists yet, so this
/// default doesn't change any current visual behavior once read.
final bool darkMode;
/// Whether notifications are enabled.
final bool notifications;
/// The user's preferred language code.
final String language;
const Settings({required this.id, required this.darkMode, required this.notifications, required this.language});@override
Map<String, Expression> toColumns(bool nullToAbsent) {
final map = <String, Expression> {};map['id'] = Variable<int>(id);
map['dark_mode'] = Variable<bool>(darkMode);
map['notifications'] = Variable<bool>(notifications);
map['language'] = Variable<String>(language);
return map; 
}
SettingsTableCompanion toCompanion(bool nullToAbsent) {
return SettingsTableCompanion(id: Value(id),darkMode: Value(darkMode),notifications: Value(notifications),language: Value(language),);
}
factory Settings.fromJson(Map<String, dynamic> json, {ValueSerializer? serializer}) {
serializer ??= driftRuntimeOptions.defaultSerializer;
return Settings(id: serializer.fromJson<int>(json['id']),darkMode: serializer.fromJson<bool>(json['darkMode']),notifications: serializer.fromJson<bool>(json['notifications']),language: serializer.fromJson<String>(json['language']),);}
@override Map<String, dynamic> toJson({ValueSerializer? serializer}) {
serializer ??= driftRuntimeOptions.defaultSerializer;
return <String, dynamic>{
'id': serializer.toJson<int>(id),'darkMode': serializer.toJson<bool>(darkMode),'notifications': serializer.toJson<bool>(notifications),'language': serializer.toJson<String>(language),};}Settings copyWith({int? id,bool? darkMode,bool? notifications,String? language}) => Settings(id: id ?? this.id,darkMode: darkMode ?? this.darkMode,notifications: notifications ?? this.notifications,language: language ?? this.language,);Settings copyWithCompanion(SettingsTableCompanion data) {
return Settings(
id: data.id.present ? data.id.value : this.id,darkMode: data.darkMode.present ? data.darkMode.value : this.darkMode,notifications: data.notifications.present ? data.notifications.value : this.notifications,language: data.language.present ? data.language.value : this.language,);
}
@override
String toString() {return (StringBuffer('Settings(')..write('id: $id, ')..write('darkMode: $darkMode, ')..write('notifications: $notifications, ')..write('language: $language')..write(')')).toString();}
@override
 int get hashCode => Object.hash(id, darkMode, notifications, language);@override
bool operator ==(Object other) => identical(this, other) || (other is Settings && other.id == this.id && other.darkMode == this.darkMode && other.notifications == this.notifications && other.language == this.language);
}class SettingsTableCompanion extends UpdateCompanion<Settings> {
final Value<int> id;
final Value<bool> darkMode;
final Value<bool> notifications;
final Value<String> language;
const SettingsTableCompanion({this.id = const Value.absent(),this.darkMode = const Value.absent(),this.notifications = const Value.absent(),this.language = const Value.absent(),});
SettingsTableCompanion.insert({this.id = const Value.absent(),this.darkMode = const Value.absent(),this.notifications = const Value.absent(),this.language = const Value.absent(),});
static Insertable<Settings> custom({Expression<int>? id, 
Expression<bool>? darkMode, 
Expression<bool>? notifications, 
Expression<String>? language, 
}) {
return RawValuesInsertable({if (id != null)'id': id,if (darkMode != null)'dark_mode': darkMode,if (notifications != null)'notifications': notifications,if (language != null)'language': language,});
}SettingsTableCompanion copyWith({Value<int>? id, Value<bool>? darkMode, Value<bool>? notifications, Value<String>? language}) {
return SettingsTableCompanion(id: id ?? this.id,darkMode: darkMode ?? this.darkMode,notifications: notifications ?? this.notifications,language: language ?? this.language,);
}
@override
Map<String, Expression> toColumns(bool nullToAbsent) {
final map = <String, Expression> {};if (id.present) {
map['id'] = Variable<int>(id.value);}
if (darkMode.present) {
map['dark_mode'] = Variable<bool>(darkMode.value);}
if (notifications.present) {
map['notifications'] = Variable<bool>(notifications.value);}
if (language.present) {
map['language'] = Variable<String>(language.value);}
return map; 
}
@override
String toString() {return (StringBuffer('SettingsTableCompanion(')..write('id: $id, ')..write('darkMode: $darkMode, ')..write('notifications: $notifications, ')..write('language: $language')..write(')')).toString();}
}
class $PendingSyncsTable extends PendingSyncs with TableInfo<$PendingSyncsTable, PendingSync>{
@override final GeneratedDatabase attachedDatabase;
final String? _alias;
$PendingSyncsTable(this.attachedDatabase, [this._alias]);
static const VerificationMeta _idMeta = const VerificationMeta('id');
@override
late final GeneratedColumn<int> id = GeneratedColumn<int>('id', aliasedName, false, hasAutoIncrement: true, type: DriftSqlType.int, requiredDuringInsert: false, defaultConstraints: GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
static const VerificationMeta _entityTypeMeta = const VerificationMeta('entityType');
@override
late final GeneratedColumnWithTypeConverter<SyncEntityType, String> entityType = GeneratedColumn<String>('entity_type', aliasedName, false, type: DriftSqlType.string, requiredDuringInsert: true).withConverter<SyncEntityType>($PendingSyncsTable.$converterentityType);
static const VerificationMeta _entityIdMeta = const VerificationMeta('entityId');
@override
late final GeneratedColumn<int> entityId = GeneratedColumn<int>('entity_id', aliasedName, false, type: DriftSqlType.int, requiredDuringInsert: true);
static const VerificationMeta _actionMeta = const VerificationMeta('action');
@override
late final GeneratedColumnWithTypeConverter<SyncAction, String> action = GeneratedColumn<String>('action', aliasedName, false, type: DriftSqlType.string, requiredDuringInsert: true).withConverter<SyncAction>($PendingSyncsTable.$converteraction);
static const VerificationMeta _createdAtMeta = const VerificationMeta('createdAt');
@override
late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>('created_at', aliasedName, false, type: DriftSqlType.dateTime, requiredDuringInsert: false, defaultValue: currentDateAndTime);
static const VerificationMeta _syncedMeta = const VerificationMeta('synced');
@override
late final GeneratedColumn<bool> synced = GeneratedColumn<bool>('synced', aliasedName, false, type: DriftSqlType.bool, requiredDuringInsert: false, defaultConstraints: GeneratedColumn.constraintIsAlways('CHECK ("synced" IN (0, 1))'), defaultValue: const Constant(false));
@override
List<GeneratedColumn> get $columns => [id, entityType, entityId, action, createdAt, synced];
@override
String get aliasedName => _alias ?? actualTableName;
@override
 String get actualTableName => $name;
static const String $name = 'pending_syncs';
@override
VerificationContext validateIntegrity(Insertable<PendingSync> instance, {bool isInserting = false}) {
final context = VerificationContext();
final data = instance.toColumns(true);
if (data.containsKey('id')) {
context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));}context.handle(_entityTypeMeta, const VerificationResult.success());if (data.containsKey('entity_id')) {
context.handle(_entityIdMeta, entityId.isAcceptableOrUnknown(data['entity_id']!, _entityIdMeta));} else if (isInserting) {
context.missing(_entityIdMeta);
}
context.handle(_actionMeta, const VerificationResult.success());if (data.containsKey('created_at')) {
context.handle(_createdAtMeta, createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));}if (data.containsKey('synced')) {
context.handle(_syncedMeta, synced.isAcceptableOrUnknown(data['synced']!, _syncedMeta));}return context;
}
@override
Set<GeneratedColumn> get $primaryKey => {id};
@override PendingSync map(Map<String, dynamic> data, {String? tablePrefix})  {
final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';return PendingSync(id: attachedDatabase.typeMapping.read(DriftSqlType.int, data['${effectivePrefix}id'])!, entityType: $PendingSyncsTable.$converterentityType.fromSql(attachedDatabase.typeMapping.read(DriftSqlType.string, data['${effectivePrefix}entity_type'])!), entityId: attachedDatabase.typeMapping.read(DriftSqlType.int, data['${effectivePrefix}entity_id'])!, action: $PendingSyncsTable.$converteraction.fromSql(attachedDatabase.typeMapping.read(DriftSqlType.string, data['${effectivePrefix}action'])!), createdAt: attachedDatabase.typeMapping.read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!, synced: attachedDatabase.typeMapping.read(DriftSqlType.bool, data['${effectivePrefix}synced'])!, );
}
@override
$PendingSyncsTable createAlias(String alias) {
return $PendingSyncsTable(attachedDatabase, alias);}static JsonTypeConverter2<SyncEntityType,String,String> $converterentityType = const EnumNameConverter<SyncEntityType>(SyncEntityType.values);static JsonTypeConverter2<SyncAction,String,String> $converteraction = const EnumNameConverter<SyncAction>(SyncAction.values);}class PendingSync extends DataClass implements Insertable<PendingSync> 
{
/// Local auto-incrementing primary key.
final int id;
/// Which table the affected record belongs to.
final SyncEntityType entityType;
/// The local id of the affected record within its own table.
final int entityId;
/// Whether the affected record was created, updated, or deleted.
final SyncAction action;
/// When this change was queued.
final DateTime createdAt;
/// Whether this change has been successfully pushed to Firebase yet.
final bool synced;
const PendingSync({required this.id, required this.entityType, required this.entityId, required this.action, required this.createdAt, required this.synced});@override
Map<String, Expression> toColumns(bool nullToAbsent) {
final map = <String, Expression> {};map['id'] = Variable<int>(id);
{map['entity_type'] = Variable<String>($PendingSyncsTable.$converterentityType.toSql(entityType));
}map['entity_id'] = Variable<int>(entityId);
{map['action'] = Variable<String>($PendingSyncsTable.$converteraction.toSql(action));
}map['created_at'] = Variable<DateTime>(createdAt);
map['synced'] = Variable<bool>(synced);
return map; 
}
PendingSyncsCompanion toCompanion(bool nullToAbsent) {
return PendingSyncsCompanion(id: Value(id),entityType: Value(entityType),entityId: Value(entityId),action: Value(action),createdAt: Value(createdAt),synced: Value(synced),);
}
factory PendingSync.fromJson(Map<String, dynamic> json, {ValueSerializer? serializer}) {
serializer ??= driftRuntimeOptions.defaultSerializer;
return PendingSync(id: serializer.fromJson<int>(json['id']),entityType: $PendingSyncsTable.$converterentityType.fromJson(serializer.fromJson<String>(json['entityType'])),entityId: serializer.fromJson<int>(json['entityId']),action: $PendingSyncsTable.$converteraction.fromJson(serializer.fromJson<String>(json['action'])),createdAt: serializer.fromJson<DateTime>(json['createdAt']),synced: serializer.fromJson<bool>(json['synced']),);}
@override Map<String, dynamic> toJson({ValueSerializer? serializer}) {
serializer ??= driftRuntimeOptions.defaultSerializer;
return <String, dynamic>{
'id': serializer.toJson<int>(id),'entityType': serializer.toJson<String>($PendingSyncsTable.$converterentityType.toJson(entityType)),'entityId': serializer.toJson<int>(entityId),'action': serializer.toJson<String>($PendingSyncsTable.$converteraction.toJson(action)),'createdAt': serializer.toJson<DateTime>(createdAt),'synced': serializer.toJson<bool>(synced),};}PendingSync copyWith({int? id,SyncEntityType? entityType,int? entityId,SyncAction? action,DateTime? createdAt,bool? synced}) => PendingSync(id: id ?? this.id,entityType: entityType ?? this.entityType,entityId: entityId ?? this.entityId,action: action ?? this.action,createdAt: createdAt ?? this.createdAt,synced: synced ?? this.synced,);PendingSync copyWithCompanion(PendingSyncsCompanion data) {
return PendingSync(
id: data.id.present ? data.id.value : this.id,entityType: data.entityType.present ? data.entityType.value : this.entityType,entityId: data.entityId.present ? data.entityId.value : this.entityId,action: data.action.present ? data.action.value : this.action,createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,synced: data.synced.present ? data.synced.value : this.synced,);
}
@override
String toString() {return (StringBuffer('PendingSync(')..write('id: $id, ')..write('entityType: $entityType, ')..write('entityId: $entityId, ')..write('action: $action, ')..write('createdAt: $createdAt, ')..write('synced: $synced')..write(')')).toString();}
@override
 int get hashCode => Object.hash(id, entityType, entityId, action, createdAt, synced);@override
bool operator ==(Object other) => identical(this, other) || (other is PendingSync && other.id == this.id && other.entityType == this.entityType && other.entityId == this.entityId && other.action == this.action && other.createdAt == this.createdAt && other.synced == this.synced);
}class PendingSyncsCompanion extends UpdateCompanion<PendingSync> {
final Value<int> id;
final Value<SyncEntityType> entityType;
final Value<int> entityId;
final Value<SyncAction> action;
final Value<DateTime> createdAt;
final Value<bool> synced;
const PendingSyncsCompanion({this.id = const Value.absent(),this.entityType = const Value.absent(),this.entityId = const Value.absent(),this.action = const Value.absent(),this.createdAt = const Value.absent(),this.synced = const Value.absent(),});
PendingSyncsCompanion.insert({this.id = const Value.absent(),required SyncEntityType entityType,required int entityId,required SyncAction action,this.createdAt = const Value.absent(),this.synced = const Value.absent(),}): entityType = Value(entityType), entityId = Value(entityId), action = Value(action);
static Insertable<PendingSync> custom({Expression<int>? id, 
Expression<String>? entityType, 
Expression<int>? entityId, 
Expression<String>? action, 
Expression<DateTime>? createdAt, 
Expression<bool>? synced, 
}) {
return RawValuesInsertable({if (id != null)'id': id,if (entityType != null)'entity_type': entityType,if (entityId != null)'entity_id': entityId,if (action != null)'action': action,if (createdAt != null)'created_at': createdAt,if (synced != null)'synced': synced,});
}PendingSyncsCompanion copyWith({Value<int>? id, Value<SyncEntityType>? entityType, Value<int>? entityId, Value<SyncAction>? action, Value<DateTime>? createdAt, Value<bool>? synced}) {
return PendingSyncsCompanion(id: id ?? this.id,entityType: entityType ?? this.entityType,entityId: entityId ?? this.entityId,action: action ?? this.action,createdAt: createdAt ?? this.createdAt,synced: synced ?? this.synced,);
}
@override
Map<String, Expression> toColumns(bool nullToAbsent) {
final map = <String, Expression> {};if (id.present) {
map['id'] = Variable<int>(id.value);}
if (entityType.present) {
map['entity_type'] = Variable<String>($PendingSyncsTable.$converterentityType.toSql(entityType.value));}
if (entityId.present) {
map['entity_id'] = Variable<int>(entityId.value);}
if (action.present) {
map['action'] = Variable<String>($PendingSyncsTable.$converteraction.toSql(action.value));}
if (createdAt.present) {
map['created_at'] = Variable<DateTime>(createdAt.value);}
if (synced.present) {
map['synced'] = Variable<bool>(synced.value);}
return map; 
}
@override
String toString() {return (StringBuffer('PendingSyncsCompanion(')..write('id: $id, ')..write('entityType: $entityType, ')..write('entityId: $entityId, ')..write('action: $action, ')..write('createdAt: $createdAt, ')..write('synced: $synced')..write(')')).toString();}
}
abstract class _$AppDatabase extends GeneratedDatabase{
_$AppDatabase(QueryExecutor e): super(e);
$AppDatabaseManager get managers => $AppDatabaseManager(this);
late final $UsersTable users = $UsersTable(this);
late final $ContactsTable contacts = $ContactsTable(this);
late final $ReportsTable reports = $ReportsTable(this);
late final $SosHistoriesTable sosHistories = $SosHistoriesTable(this);
late final $SettingsTableTable settingsTable = $SettingsTableTable(this);
late final $PendingSyncsTable pendingSyncs = $PendingSyncsTable(this);
@override
Iterable<TableInfo<Table, Object?>> get allTables => allSchemaEntities.whereType<TableInfo<Table, Object?>>();
@override
List<DatabaseSchemaEntity> get allSchemaEntities => [users, contacts, reports, sosHistories, settingsTable, pendingSyncs];
}
typedef $$UsersTableCreateCompanionBuilder = UsersCompanion Function({Value<int> id,required String name,required String phone,Value<String?> email,Value<DateTime> createdAt,});
typedef $$UsersTableUpdateCompanionBuilder = UsersCompanion Function({Value<int> id,Value<String> name,Value<String> phone,Value<String?> email,Value<DateTime> createdAt,});
class $$UsersTableFilterComposer extends Composer<
        _$AppDatabase,
        $UsersTable> {
        $$UsersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          ColumnFilters<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<String> get name => $composableBuilder(
      column: $table.name,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<String> get phone => $composableBuilder(
      column: $table.phone,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<String> get email => $composableBuilder(
      column: $table.email,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt,
      builder: (column) => 
      ColumnFilters(column));
      
        }
      class $$UsersTableOrderingComposer extends Composer<
        _$AppDatabase,
        $UsersTable> {
        $$UsersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<String> get phone => $composableBuilder(
      column: $table.phone,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<String> get email => $composableBuilder(
      column: $table.email,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt,
      builder: (column) => 
      ColumnOrderings(column));
      
        }
      class $$UsersTableAnnotationComposer extends Composer<
        _$AppDatabase,
        $UsersTable> {
        $$UsersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          GeneratedColumn<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => column);
      
GeneratedColumn<String> get name => $composableBuilder(
      column: $table.name,
      builder: (column) => column);
      
GeneratedColumn<String> get phone => $composableBuilder(
      column: $table.phone,
      builder: (column) => column);
      
GeneratedColumn<String> get email => $composableBuilder(
      column: $table.email,
      builder: (column) => column);
      
GeneratedColumn<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt,
      builder: (column) => column);
      
        }
      class $$UsersTableTableManager extends RootTableManager    <_$AppDatabase,
    $UsersTable,
    User,
    $$UsersTableFilterComposer,
    $$UsersTableOrderingComposer,
    $$UsersTableAnnotationComposer,
    $$UsersTableCreateCompanionBuilder,
    $$UsersTableUpdateCompanionBuilder,
    (User,BaseReferences<_$AppDatabase,$UsersTable,User>),
    User,
    PrefetchHooks Function()
    > {
    $$UsersTableTableManager(_$AppDatabase db, $UsersTable table) : super(
      TableManagerState(
        db: db,
        table: table,
        createFilteringComposer: () => $$UsersTableFilterComposer($db: db,$table:table),
        createOrderingComposer: () => $$UsersTableOrderingComposer($db: db,$table:table),
        createComputedFieldComposer: () => $$UsersTableAnnotationComposer($db: db,$table:table),
        updateCompanionCallback: ({Value<int> id = const Value.absent(),Value<String> name = const Value.absent(),Value<String> phone = const Value.absent(),Value<String?> email = const Value.absent(),Value<DateTime> createdAt = const Value.absent(),})=> UsersCompanion(id: id,name: name,phone: phone,email: email,createdAt: createdAt,),
        createCompanionCallback: ({Value<int> id = const Value.absent(),required String name,required String phone,Value<String?> email = const Value.absent(),Value<DateTime> createdAt = const Value.absent(),})=> UsersCompanion.insert(id: id,name: name,phone: phone,email: email,createdAt: createdAt,),
        withReferenceMapper: (p0) => p0
              .map(
                  (e) =>
                     (e.readTable(table), BaseReferences(db, table, e))
                  )
              .toList(),
        prefetchHooksCallback: null,
        ));
        }
    typedef $$UsersTableProcessedTableManager = ProcessedTableManager    <_$AppDatabase,
    $UsersTable,
    User,
    $$UsersTableFilterComposer,
    $$UsersTableOrderingComposer,
    $$UsersTableAnnotationComposer,
    $$UsersTableCreateCompanionBuilder,
    $$UsersTableUpdateCompanionBuilder,
    (User,BaseReferences<_$AppDatabase,$UsersTable,User>),
    User,
    PrefetchHooks Function()
    >;typedef $$ContactsTableCreateCompanionBuilder = ContactsCompanion Function({Value<int> id,required String name,required String phone,Value<String?> relationship,Value<bool> isPrimary,});
typedef $$ContactsTableUpdateCompanionBuilder = ContactsCompanion Function({Value<int> id,Value<String> name,Value<String> phone,Value<String?> relationship,Value<bool> isPrimary,});
class $$ContactsTableFilterComposer extends Composer<
        _$AppDatabase,
        $ContactsTable> {
        $$ContactsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          ColumnFilters<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<String> get name => $composableBuilder(
      column: $table.name,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<String> get phone => $composableBuilder(
      column: $table.phone,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<String> get relationship => $composableBuilder(
      column: $table.relationship,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<bool> get isPrimary => $composableBuilder(
      column: $table.isPrimary,
      builder: (column) => 
      ColumnFilters(column));
      
        }
      class $$ContactsTableOrderingComposer extends Composer<
        _$AppDatabase,
        $ContactsTable> {
        $$ContactsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<String> get phone => $composableBuilder(
      column: $table.phone,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<String> get relationship => $composableBuilder(
      column: $table.relationship,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<bool> get isPrimary => $composableBuilder(
      column: $table.isPrimary,
      builder: (column) => 
      ColumnOrderings(column));
      
        }
      class $$ContactsTableAnnotationComposer extends Composer<
        _$AppDatabase,
        $ContactsTable> {
        $$ContactsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          GeneratedColumn<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => column);
      
GeneratedColumn<String> get name => $composableBuilder(
      column: $table.name,
      builder: (column) => column);
      
GeneratedColumn<String> get phone => $composableBuilder(
      column: $table.phone,
      builder: (column) => column);
      
GeneratedColumn<String> get relationship => $composableBuilder(
      column: $table.relationship,
      builder: (column) => column);
      
GeneratedColumn<bool> get isPrimary => $composableBuilder(
      column: $table.isPrimary,
      builder: (column) => column);
      
        }
      class $$ContactsTableTableManager extends RootTableManager    <_$AppDatabase,
    $ContactsTable,
    Contact,
    $$ContactsTableFilterComposer,
    $$ContactsTableOrderingComposer,
    $$ContactsTableAnnotationComposer,
    $$ContactsTableCreateCompanionBuilder,
    $$ContactsTableUpdateCompanionBuilder,
    (Contact,BaseReferences<_$AppDatabase,$ContactsTable,Contact>),
    Contact,
    PrefetchHooks Function()
    > {
    $$ContactsTableTableManager(_$AppDatabase db, $ContactsTable table) : super(
      TableManagerState(
        db: db,
        table: table,
        createFilteringComposer: () => $$ContactsTableFilterComposer($db: db,$table:table),
        createOrderingComposer: () => $$ContactsTableOrderingComposer($db: db,$table:table),
        createComputedFieldComposer: () => $$ContactsTableAnnotationComposer($db: db,$table:table),
        updateCompanionCallback: ({Value<int> id = const Value.absent(),Value<String> name = const Value.absent(),Value<String> phone = const Value.absent(),Value<String?> relationship = const Value.absent(),Value<bool> isPrimary = const Value.absent(),})=> ContactsCompanion(id: id,name: name,phone: phone,relationship: relationship,isPrimary: isPrimary,),
        createCompanionCallback: ({Value<int> id = const Value.absent(),required String name,required String phone,Value<String?> relationship = const Value.absent(),Value<bool> isPrimary = const Value.absent(),})=> ContactsCompanion.insert(id: id,name: name,phone: phone,relationship: relationship,isPrimary: isPrimary,),
        withReferenceMapper: (p0) => p0
              .map(
                  (e) =>
                     (e.readTable(table), BaseReferences(db, table, e))
                  )
              .toList(),
        prefetchHooksCallback: null,
        ));
        }
    typedef $$ContactsTableProcessedTableManager = ProcessedTableManager    <_$AppDatabase,
    $ContactsTable,
    Contact,
    $$ContactsTableFilterComposer,
    $$ContactsTableOrderingComposer,
    $$ContactsTableAnnotationComposer,
    $$ContactsTableCreateCompanionBuilder,
    $$ContactsTableUpdateCompanionBuilder,
    (Contact,BaseReferences<_$AppDatabase,$ContactsTable,Contact>),
    Contact,
    PrefetchHooks Function()
    >;typedef $$ReportsTableCreateCompanionBuilder = ReportsCompanion Function({Value<int> id,required double latitude,required double longitude,Value<String?> description,required String category,required String severity,Value<String?> imagePath,Value<bool> synced,Value<DateTime> timestamp,});
typedef $$ReportsTableUpdateCompanionBuilder = ReportsCompanion Function({Value<int> id,Value<double> latitude,Value<double> longitude,Value<String?> description,Value<String> category,Value<String> severity,Value<String?> imagePath,Value<bool> synced,Value<DateTime> timestamp,});
class $$ReportsTableFilterComposer extends Composer<
        _$AppDatabase,
        $ReportsTable> {
        $$ReportsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          ColumnFilters<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<double> get latitude => $composableBuilder(
      column: $table.latitude,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<double> get longitude => $composableBuilder(
      column: $table.longitude,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<String> get description => $composableBuilder(
      column: $table.description,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<String> get category => $composableBuilder(
      column: $table.category,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<String> get severity => $composableBuilder(
      column: $table.severity,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<String> get imagePath => $composableBuilder(
      column: $table.imagePath,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<bool> get synced => $composableBuilder(
      column: $table.synced,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<DateTime> get timestamp => $composableBuilder(
      column: $table.timestamp,
      builder: (column) => 
      ColumnFilters(column));
      
        }
      class $$ReportsTableOrderingComposer extends Composer<
        _$AppDatabase,
        $ReportsTable> {
        $$ReportsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<double> get latitude => $composableBuilder(
      column: $table.latitude,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<double> get longitude => $composableBuilder(
      column: $table.longitude,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<String> get description => $composableBuilder(
      column: $table.description,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<String> get category => $composableBuilder(
      column: $table.category,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<String> get severity => $composableBuilder(
      column: $table.severity,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<String> get imagePath => $composableBuilder(
      column: $table.imagePath,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<bool> get synced => $composableBuilder(
      column: $table.synced,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<DateTime> get timestamp => $composableBuilder(
      column: $table.timestamp,
      builder: (column) => 
      ColumnOrderings(column));
      
        }
      class $$ReportsTableAnnotationComposer extends Composer<
        _$AppDatabase,
        $ReportsTable> {
        $$ReportsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          GeneratedColumn<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => column);
      
GeneratedColumn<double> get latitude => $composableBuilder(
      column: $table.latitude,
      builder: (column) => column);
      
GeneratedColumn<double> get longitude => $composableBuilder(
      column: $table.longitude,
      builder: (column) => column);
      
GeneratedColumn<String> get description => $composableBuilder(
      column: $table.description,
      builder: (column) => column);
      
GeneratedColumn<String> get category => $composableBuilder(
      column: $table.category,
      builder: (column) => column);
      
GeneratedColumn<String> get severity => $composableBuilder(
      column: $table.severity,
      builder: (column) => column);
      
GeneratedColumn<String> get imagePath => $composableBuilder(
      column: $table.imagePath,
      builder: (column) => column);
      
GeneratedColumn<bool> get synced => $composableBuilder(
      column: $table.synced,
      builder: (column) => column);
      
GeneratedColumn<DateTime> get timestamp => $composableBuilder(
      column: $table.timestamp,
      builder: (column) => column);
      
        }
      class $$ReportsTableTableManager extends RootTableManager    <_$AppDatabase,
    $ReportsTable,
    Report,
    $$ReportsTableFilterComposer,
    $$ReportsTableOrderingComposer,
    $$ReportsTableAnnotationComposer,
    $$ReportsTableCreateCompanionBuilder,
    $$ReportsTableUpdateCompanionBuilder,
    (Report,BaseReferences<_$AppDatabase,$ReportsTable,Report>),
    Report,
    PrefetchHooks Function()
    > {
    $$ReportsTableTableManager(_$AppDatabase db, $ReportsTable table) : super(
      TableManagerState(
        db: db,
        table: table,
        createFilteringComposer: () => $$ReportsTableFilterComposer($db: db,$table:table),
        createOrderingComposer: () => $$ReportsTableOrderingComposer($db: db,$table:table),
        createComputedFieldComposer: () => $$ReportsTableAnnotationComposer($db: db,$table:table),
        updateCompanionCallback: ({Value<int> id = const Value.absent(),Value<double> latitude = const Value.absent(),Value<double> longitude = const Value.absent(),Value<String?> description = const Value.absent(),Value<String> category = const Value.absent(),Value<String> severity = const Value.absent(),Value<String?> imagePath = const Value.absent(),Value<bool> synced = const Value.absent(),Value<DateTime> timestamp = const Value.absent(),})=> ReportsCompanion(id: id,latitude: latitude,longitude: longitude,description: description,category: category,severity: severity,imagePath: imagePath,synced: synced,timestamp: timestamp,),
        createCompanionCallback: ({Value<int> id = const Value.absent(),required double latitude,required double longitude,Value<String?> description = const Value.absent(),required String category,required String severity,Value<String?> imagePath = const Value.absent(),Value<bool> synced = const Value.absent(),Value<DateTime> timestamp = const Value.absent(),})=> ReportsCompanion.insert(id: id,latitude: latitude,longitude: longitude,description: description,category: category,severity: severity,imagePath: imagePath,synced: synced,timestamp: timestamp,),
        withReferenceMapper: (p0) => p0
              .map(
                  (e) =>
                     (e.readTable(table), BaseReferences(db, table, e))
                  )
              .toList(),
        prefetchHooksCallback: null,
        ));
        }
    typedef $$ReportsTableProcessedTableManager = ProcessedTableManager    <_$AppDatabase,
    $ReportsTable,
    Report,
    $$ReportsTableFilterComposer,
    $$ReportsTableOrderingComposer,
    $$ReportsTableAnnotationComposer,
    $$ReportsTableCreateCompanionBuilder,
    $$ReportsTableUpdateCompanionBuilder,
    (Report,BaseReferences<_$AppDatabase,$ReportsTable,Report>),
    Report,
    PrefetchHooks Function()
    >;typedef $$SosHistoriesTableCreateCompanionBuilder = SosHistoriesCompanion Function({Value<int> id,required double latitude,required double longitude,Value<DateTime> timestamp,Value<bool> sent,});
typedef $$SosHistoriesTableUpdateCompanionBuilder = SosHistoriesCompanion Function({Value<int> id,Value<double> latitude,Value<double> longitude,Value<DateTime> timestamp,Value<bool> sent,});
class $$SosHistoriesTableFilterComposer extends Composer<
        _$AppDatabase,
        $SosHistoriesTable> {
        $$SosHistoriesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          ColumnFilters<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<double> get latitude => $composableBuilder(
      column: $table.latitude,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<double> get longitude => $composableBuilder(
      column: $table.longitude,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<DateTime> get timestamp => $composableBuilder(
      column: $table.timestamp,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<bool> get sent => $composableBuilder(
      column: $table.sent,
      builder: (column) => 
      ColumnFilters(column));
      
        }
      class $$SosHistoriesTableOrderingComposer extends Composer<
        _$AppDatabase,
        $SosHistoriesTable> {
        $$SosHistoriesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<double> get latitude => $composableBuilder(
      column: $table.latitude,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<double> get longitude => $composableBuilder(
      column: $table.longitude,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<DateTime> get timestamp => $composableBuilder(
      column: $table.timestamp,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<bool> get sent => $composableBuilder(
      column: $table.sent,
      builder: (column) => 
      ColumnOrderings(column));
      
        }
      class $$SosHistoriesTableAnnotationComposer extends Composer<
        _$AppDatabase,
        $SosHistoriesTable> {
        $$SosHistoriesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          GeneratedColumn<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => column);
      
GeneratedColumn<double> get latitude => $composableBuilder(
      column: $table.latitude,
      builder: (column) => column);
      
GeneratedColumn<double> get longitude => $composableBuilder(
      column: $table.longitude,
      builder: (column) => column);
      
GeneratedColumn<DateTime> get timestamp => $composableBuilder(
      column: $table.timestamp,
      builder: (column) => column);
      
GeneratedColumn<bool> get sent => $composableBuilder(
      column: $table.sent,
      builder: (column) => column);
      
        }
      class $$SosHistoriesTableTableManager extends RootTableManager    <_$AppDatabase,
    $SosHistoriesTable,
    SosHistory,
    $$SosHistoriesTableFilterComposer,
    $$SosHistoriesTableOrderingComposer,
    $$SosHistoriesTableAnnotationComposer,
    $$SosHistoriesTableCreateCompanionBuilder,
    $$SosHistoriesTableUpdateCompanionBuilder,
    (SosHistory,BaseReferences<_$AppDatabase,$SosHistoriesTable,SosHistory>),
    SosHistory,
    PrefetchHooks Function()
    > {
    $$SosHistoriesTableTableManager(_$AppDatabase db, $SosHistoriesTable table) : super(
      TableManagerState(
        db: db,
        table: table,
        createFilteringComposer: () => $$SosHistoriesTableFilterComposer($db: db,$table:table),
        createOrderingComposer: () => $$SosHistoriesTableOrderingComposer($db: db,$table:table),
        createComputedFieldComposer: () => $$SosHistoriesTableAnnotationComposer($db: db,$table:table),
        updateCompanionCallback: ({Value<int> id = const Value.absent(),Value<double> latitude = const Value.absent(),Value<double> longitude = const Value.absent(),Value<DateTime> timestamp = const Value.absent(),Value<bool> sent = const Value.absent(),})=> SosHistoriesCompanion(id: id,latitude: latitude,longitude: longitude,timestamp: timestamp,sent: sent,),
        createCompanionCallback: ({Value<int> id = const Value.absent(),required double latitude,required double longitude,Value<DateTime> timestamp = const Value.absent(),Value<bool> sent = const Value.absent(),})=> SosHistoriesCompanion.insert(id: id,latitude: latitude,longitude: longitude,timestamp: timestamp,sent: sent,),
        withReferenceMapper: (p0) => p0
              .map(
                  (e) =>
                     (e.readTable(table), BaseReferences(db, table, e))
                  )
              .toList(),
        prefetchHooksCallback: null,
        ));
        }
    typedef $$SosHistoriesTableProcessedTableManager = ProcessedTableManager    <_$AppDatabase,
    $SosHistoriesTable,
    SosHistory,
    $$SosHistoriesTableFilterComposer,
    $$SosHistoriesTableOrderingComposer,
    $$SosHistoriesTableAnnotationComposer,
    $$SosHistoriesTableCreateCompanionBuilder,
    $$SosHistoriesTableUpdateCompanionBuilder,
    (SosHistory,BaseReferences<_$AppDatabase,$SosHistoriesTable,SosHistory>),
    SosHistory,
    PrefetchHooks Function()
    >;typedef $$SettingsTableTableCreateCompanionBuilder = SettingsTableCompanion Function({Value<int> id,Value<bool> darkMode,Value<bool> notifications,Value<String> language,});
typedef $$SettingsTableTableUpdateCompanionBuilder = SettingsTableCompanion Function({Value<int> id,Value<bool> darkMode,Value<bool> notifications,Value<String> language,});
class $$SettingsTableTableFilterComposer extends Composer<
        _$AppDatabase,
        $SettingsTableTable> {
        $$SettingsTableTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          ColumnFilters<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<bool> get darkMode => $composableBuilder(
      column: $table.darkMode,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<bool> get notifications => $composableBuilder(
      column: $table.notifications,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<String> get language => $composableBuilder(
      column: $table.language,
      builder: (column) => 
      ColumnFilters(column));
      
        }
      class $$SettingsTableTableOrderingComposer extends Composer<
        _$AppDatabase,
        $SettingsTableTable> {
        $$SettingsTableTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<bool> get darkMode => $composableBuilder(
      column: $table.darkMode,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<bool> get notifications => $composableBuilder(
      column: $table.notifications,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<String> get language => $composableBuilder(
      column: $table.language,
      builder: (column) => 
      ColumnOrderings(column));
      
        }
      class $$SettingsTableTableAnnotationComposer extends Composer<
        _$AppDatabase,
        $SettingsTableTable> {
        $$SettingsTableTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          GeneratedColumn<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => column);
      
GeneratedColumn<bool> get darkMode => $composableBuilder(
      column: $table.darkMode,
      builder: (column) => column);
      
GeneratedColumn<bool> get notifications => $composableBuilder(
      column: $table.notifications,
      builder: (column) => column);
      
GeneratedColumn<String> get language => $composableBuilder(
      column: $table.language,
      builder: (column) => column);
      
        }
      class $$SettingsTableTableTableManager extends RootTableManager    <_$AppDatabase,
    $SettingsTableTable,
    Settings,
    $$SettingsTableTableFilterComposer,
    $$SettingsTableTableOrderingComposer,
    $$SettingsTableTableAnnotationComposer,
    $$SettingsTableTableCreateCompanionBuilder,
    $$SettingsTableTableUpdateCompanionBuilder,
    (Settings,BaseReferences<_$AppDatabase,$SettingsTableTable,Settings>),
    Settings,
    PrefetchHooks Function()
    > {
    $$SettingsTableTableTableManager(_$AppDatabase db, $SettingsTableTable table) : super(
      TableManagerState(
        db: db,
        table: table,
        createFilteringComposer: () => $$SettingsTableTableFilterComposer($db: db,$table:table),
        createOrderingComposer: () => $$SettingsTableTableOrderingComposer($db: db,$table:table),
        createComputedFieldComposer: () => $$SettingsTableTableAnnotationComposer($db: db,$table:table),
        updateCompanionCallback: ({Value<int> id = const Value.absent(),Value<bool> darkMode = const Value.absent(),Value<bool> notifications = const Value.absent(),Value<String> language = const Value.absent(),})=> SettingsTableCompanion(id: id,darkMode: darkMode,notifications: notifications,language: language,),
        createCompanionCallback: ({Value<int> id = const Value.absent(),Value<bool> darkMode = const Value.absent(),Value<bool> notifications = const Value.absent(),Value<String> language = const Value.absent(),})=> SettingsTableCompanion.insert(id: id,darkMode: darkMode,notifications: notifications,language: language,),
        withReferenceMapper: (p0) => p0
              .map(
                  (e) =>
                     (e.readTable(table), BaseReferences(db, table, e))
                  )
              .toList(),
        prefetchHooksCallback: null,
        ));
        }
    typedef $$SettingsTableTableProcessedTableManager = ProcessedTableManager    <_$AppDatabase,
    $SettingsTableTable,
    Settings,
    $$SettingsTableTableFilterComposer,
    $$SettingsTableTableOrderingComposer,
    $$SettingsTableTableAnnotationComposer,
    $$SettingsTableTableCreateCompanionBuilder,
    $$SettingsTableTableUpdateCompanionBuilder,
    (Settings,BaseReferences<_$AppDatabase,$SettingsTableTable,Settings>),
    Settings,
    PrefetchHooks Function()
    >;typedef $$PendingSyncsTableCreateCompanionBuilder = PendingSyncsCompanion Function({Value<int> id,required SyncEntityType entityType,required int entityId,required SyncAction action,Value<DateTime> createdAt,Value<bool> synced,});
typedef $$PendingSyncsTableUpdateCompanionBuilder = PendingSyncsCompanion Function({Value<int> id,Value<SyncEntityType> entityType,Value<int> entityId,Value<SyncAction> action,Value<DateTime> createdAt,Value<bool> synced,});
class $$PendingSyncsTableFilterComposer extends Composer<
        _$AppDatabase,
        $PendingSyncsTable> {
        $$PendingSyncsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          ColumnFilters<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => 
      ColumnFilters(column));
      
          ColumnWithTypeConverterFilters<SyncEntityType,SyncEntityType,String> get entityType => $composableBuilder(
      column: $table.entityType,
      builder: (column) => 
      ColumnWithTypeConverterFilters(column));
      
ColumnFilters<int> get entityId => $composableBuilder(
      column: $table.entityId,
      builder: (column) => 
      ColumnFilters(column));
      
          ColumnWithTypeConverterFilters<SyncAction,SyncAction,String> get action => $composableBuilder(
      column: $table.action,
      builder: (column) => 
      ColumnWithTypeConverterFilters(column));
      
ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt,
      builder: (column) => 
      ColumnFilters(column));
      
ColumnFilters<bool> get synced => $composableBuilder(
      column: $table.synced,
      builder: (column) => 
      ColumnFilters(column));
      
        }
      class $$PendingSyncsTableOrderingComposer extends Composer<
        _$AppDatabase,
        $PendingSyncsTable> {
        $$PendingSyncsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<String> get entityType => $composableBuilder(
      column: $table.entityType,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<int> get entityId => $composableBuilder(
      column: $table.entityId,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<String> get action => $composableBuilder(
      column: $table.action,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt,
      builder: (column) => 
      ColumnOrderings(column));
      
ColumnOrderings<bool> get synced => $composableBuilder(
      column: $table.synced,
      builder: (column) => 
      ColumnOrderings(column));
      
        }
      class $$PendingSyncsTableAnnotationComposer extends Composer<
        _$AppDatabase,
        $PendingSyncsTable> {
        $$PendingSyncsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
          GeneratedColumn<int> get id => $composableBuilder(
      column: $table.id,
      builder: (column) => column);
      
          GeneratedColumnWithTypeConverter<SyncEntityType,String> get entityType => $composableBuilder(
      column: $table.entityType,
      builder: (column) => column);
      
GeneratedColumn<int> get entityId => $composableBuilder(
      column: $table.entityId,
      builder: (column) => column);
      
          GeneratedColumnWithTypeConverter<SyncAction,String> get action => $composableBuilder(
      column: $table.action,
      builder: (column) => column);
      
GeneratedColumn<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt,
      builder: (column) => column);
      
GeneratedColumn<bool> get synced => $composableBuilder(
      column: $table.synced,
      builder: (column) => column);
      
        }
      class $$PendingSyncsTableTableManager extends RootTableManager    <_$AppDatabase,
    $PendingSyncsTable,
    PendingSync,
    $$PendingSyncsTableFilterComposer,
    $$PendingSyncsTableOrderingComposer,
    $$PendingSyncsTableAnnotationComposer,
    $$PendingSyncsTableCreateCompanionBuilder,
    $$PendingSyncsTableUpdateCompanionBuilder,
    (PendingSync,BaseReferences<_$AppDatabase,$PendingSyncsTable,PendingSync>),
    PendingSync,
    PrefetchHooks Function()
    > {
    $$PendingSyncsTableTableManager(_$AppDatabase db, $PendingSyncsTable table) : super(
      TableManagerState(
        db: db,
        table: table,
        createFilteringComposer: () => $$PendingSyncsTableFilterComposer($db: db,$table:table),
        createOrderingComposer: () => $$PendingSyncsTableOrderingComposer($db: db,$table:table),
        createComputedFieldComposer: () => $$PendingSyncsTableAnnotationComposer($db: db,$table:table),
        updateCompanionCallback: ({Value<int> id = const Value.absent(),Value<SyncEntityType> entityType = const Value.absent(),Value<int> entityId = const Value.absent(),Value<SyncAction> action = const Value.absent(),Value<DateTime> createdAt = const Value.absent(),Value<bool> synced = const Value.absent(),})=> PendingSyncsCompanion(id: id,entityType: entityType,entityId: entityId,action: action,createdAt: createdAt,synced: synced,),
        createCompanionCallback: ({Value<int> id = const Value.absent(),required SyncEntityType entityType,required int entityId,required SyncAction action,Value<DateTime> createdAt = const Value.absent(),Value<bool> synced = const Value.absent(),})=> PendingSyncsCompanion.insert(id: id,entityType: entityType,entityId: entityId,action: action,createdAt: createdAt,synced: synced,),
        withReferenceMapper: (p0) => p0
              .map(
                  (e) =>
                     (e.readTable(table), BaseReferences(db, table, e))
                  )
              .toList(),
        prefetchHooksCallback: null,
        ));
        }
    typedef $$PendingSyncsTableProcessedTableManager = ProcessedTableManager    <_$AppDatabase,
    $PendingSyncsTable,
    PendingSync,
    $$PendingSyncsTableFilterComposer,
    $$PendingSyncsTableOrderingComposer,
    $$PendingSyncsTableAnnotationComposer,
    $$PendingSyncsTableCreateCompanionBuilder,
    $$PendingSyncsTableUpdateCompanionBuilder,
    (PendingSync,BaseReferences<_$AppDatabase,$PendingSyncsTable,PendingSync>),
    PendingSync,
    PrefetchHooks Function()
    >;class $AppDatabaseManager {
final _$AppDatabase _db;
$AppDatabaseManager(this._db);
$$UsersTableTableManager get users => $$UsersTableTableManager(_db, _db.users);
$$ContactsTableTableManager get contacts => $$ContactsTableTableManager(_db, _db.contacts);
$$ReportsTableTableManager get reports => $$ReportsTableTableManager(_db, _db.reports);
$$SosHistoriesTableTableManager get sosHistories => $$SosHistoriesTableTableManager(_db, _db.sosHistories);
$$SettingsTableTableTableManager get settingsTable => $$SettingsTableTableTableManager(_db, _db.settingsTable);
$$PendingSyncsTableTableManager get pendingSyncs => $$PendingSyncsTableTableManager(_db, _db.pendingSyncs);
}
