
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum AddrType {
    OWN = "OWN",
    RENTED = "RENTED"
}

export enum LocationType {
    HOME = "HOME",
    OFFICE = "OFFICE",
    USER = "USER"
}

export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    SUB_ADMIN = "SUB_ADMIN",
    LOCAL_ADMIN = "LOCAL_ADMIN",
    USER = "USER"
}

export interface SearchCommitteeUsersInput {
    start: number;
    length: number;
    filterBy?: Nullable<string>;
    committeeId?: Nullable<number>;
    designationId?: Nullable<number>;
    filter_by?: Nullable<SearchCommitteeUsersFilterInput>;
}

export interface SearchCommitteeUsersFilterInput {
    str_search?: Nullable<string>;
    local_community_id?: Nullable<number>;
    sub_community_id?: Nullable<number>;
    committee_id?: Nullable<number>;
    designation_id?: Nullable<number>;
    start_date?: Nullable<string>;
    end_date?: Nullable<string>;
}

export interface GetUsersByDateInput {
    fromdate?: Nullable<string>;
    todate?: Nullable<string>;
    date?: Nullable<string>;
    filter?: Nullable<number>;
    id?: Nullable<number>;
    sub_community_id?: Nullable<number>;
    start: number;
    length: number;
}

export interface GetInactiveUsersInput {
    start?: Nullable<number>;
    length?: Nullable<number>;
    sub_community_id?: Nullable<number>;
    local_community_id?: Nullable<number>;
}

export interface GetContactListInput {
    mobiles: string[];
}

export interface SearchByCityInput {
    cityId?: Nullable<number>;
    subCommunityId?: Nullable<number>;
    alpha?: Nullable<string>;
    search?: Nullable<string>;
    start?: Nullable<number>;
    length?: Nullable<number>;
}

export interface DateInputDto {
    date?: Nullable<string>;
}

export interface StatisticsInputDto {
    cityId?: Nullable<number>;
    subCommunityId?: Nullable<number>;
    localCommunityId?: Nullable<number>;
}

export interface SearchInput {
    start: number;
    length: number;
    filterBy?: Nullable<string>;
    sub_community_id?: Nullable<number>;
}

export interface SearchRequestDTO {
    start: number;
    length: number;
    orderBy?: Nullable<string>;
    alpha?: Nullable<string>;
    orderByVal?: Nullable<string>;
    filter_by?: Nullable<SmartFilterDto>;
}

export interface SmartFilterDto {
    id?: Nullable<number>;
    role?: Nullable<Role>;
    last_name_id?: Nullable<number>;
    local_community_id?: Nullable<number>;
    sub_community_id?: Nullable<number>;
    native_place_id?: Nullable<number>;
    city_id?: Nullable<number>;
    member_code?: Nullable<string>;
    head_name?: Nullable<string>;
    first_name?: Nullable<string>;
    father_name?: Nullable<string>;
    mother_name?: Nullable<string>;
    gender?: Nullable<boolean>;
    marital_status?: Nullable<string>;
    min_age?: Nullable<number>;
    max_age?: Nullable<number>;
    min_height?: Nullable<number>;
    max_height?: Nullable<number>;
    min_weight?: Nullable<number>;
    max_weight?: Nullable<number>;
    min_percentage?: Nullable<number>;
    max_percentage?: Nullable<number>;
    state_id?: Nullable<number>;
    email_address?: Nullable<string>;
    mobile?: Nullable<string>;
    local_address?: Nullable<string>;
    address?: Nullable<string>;
    pincode?: Nullable<string>;
    area?: Nullable<string>;
    business_address?: Nullable<string>;
    education_id?: Nullable<number>;
    gotra_id?: Nullable<number>;
    business_category_id?: Nullable<number>;
    occupation_id?: Nullable<number>;
    birth_place_id?: Nullable<number>;
    birth_date?: Nullable<string>;
    marriage_date?: Nullable<string>;
    expire_date?: Nullable<string>;
    updated_dt?: Nullable<string>;
    blood_group?: Nullable<string>;
    is_donor?: Nullable<boolean>;
    is_rented?: Nullable<boolean>;
    is_expired?: Nullable<boolean>;
    is_spect?: Nullable<boolean>;
    matrimony?: Nullable<boolean>;
    is_shani?: Nullable<boolean>;
    is_mangal?: Nullable<boolean>;
    str_search?: Nullable<string>;
    committee_id?: Nullable<number>;
    designation_id?: Nullable<number>;
    start_date?: Nullable<string>;
    end_date?: Nullable<string>;
}

export interface GetNearbyUsersInput {
    lat: number;
    lng: number;
    km: number;
    nearBy?: Nullable<string>;
    start?: Nullable<number>;
    length?: Nullable<number>;
    subCommunityId?: Nullable<number>;
    user_id?: Nullable<number>;
}

export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}

export interface UpsertUserInput {
    user_id?: Nullable<number>;
    role: Role;
    head_id?: Nullable<number>;
    member_code?: Nullable<string>;
    email?: Nullable<string>;
    mobile?: Nullable<string>;
    password?: Nullable<string>;
    relation_id?: Nullable<number>;
    sub_community_id?: Nullable<number>;
    local_community_id?: Nullable<number>;
    first_name?: Nullable<string>;
    last_name_id?: Nullable<number>;
    father_name?: Nullable<string>;
    mother_name?: Nullable<string>;
    status: boolean;
    gender?: Nullable<boolean>;
    phone?: Nullable<string>;
    profile_pic: string;
    region?: Nullable<string>;
    is_expired: boolean;
    expire_date?: Nullable<DateTime>;
    education_id?: Nullable<number>;
    occupation_id?: Nullable<number>;
    deleted: boolean;
    login_status?: Nullable<boolean>;
    last_login?: Nullable<DateTime>;
    profile_percent: number;
    city_id?: Nullable<number>;
    states_id?: Nullable<number>;
    addr_type: AddrType;
    address?: Nullable<string>;
    area?: Nullable<string>;
    pincode?: Nullable<string>;
    local_address?: Nullable<string>;
    mosaad_id?: Nullable<number>;
    is_donor: boolean;
    matrimony: boolean;
    birth_date?: Nullable<DateTime>;
    native_place_id?: Nullable<number>;
    blood_group?: Nullable<string>;
    current_activity_id?: Nullable<number>;
    marital_status?: Nullable<string>;
    marriage_date?: Nullable<DateTime>;
    gotra_id?: Nullable<number>;
    business_category_id?: Nullable<number>;
    business_address?: Nullable<string>;
    business_logo?: Nullable<string>;
    company_name?: Nullable<string>;
    website?: Nullable<string>;
    work_details?: Nullable<string>;
    birth_time?: Nullable<string>;
    birth_place_id?: Nullable<number>;
    hobby?: Nullable<string>;
    about_me?: Nullable<string>;
    weight?: Nullable<number>;
    height?: Nullable<number>;
    is_spect: boolean;
    is_mangal: boolean;
    is_shani: boolean;
    facebook_profile?: Nullable<string>;
    expectation?: Nullable<string>;
}

export interface GetUserActivityStatusInput {
    id: number;
}

export interface InnerLoginInput {
    id: number;
    password: string;
}

export interface InnerLogoutInput {
    id: number;
}

export interface ChangeRoleInput {
    idList: number[];
    role: string;
    subCommunityId?: Nullable<number>;
    localCommunityId?: Nullable<number>;
}

export interface StatusChangeInputDto {
    idList: string;
    status: number;
    extra_info?: Nullable<number>;
    password?: Nullable<string>;
    relation_id?: Nullable<number>;
    head_id?: Nullable<number>;
    id?: Nullable<number>;
}

export interface CreateReminderInput {
    user_id: number;
    rem_date: DateTime;
    rem_type: string;
    message: string;
}

export interface UpdateReminderInput {
    user_id?: Nullable<number>;
    rem_date?: Nullable<DateTime>;
    rem_type?: Nullable<string>;
    message?: Nullable<string>;
    id: number;
}

export interface RegisterInput {
    first_name: string;
    last_name_id: number;
    email: string;
    mobile: string;
    password: string;
    sub_community_id: number;
    local_community_id: number;
    gender: boolean;
    profile_pic: string;
    states_id: number;
    city_id: number;
    address: string;
    status: boolean;
}

export interface LoginInput {
    mobile: string;
    password: string;
}

export interface ForgotPasswordInput {
    email?: Nullable<string>;
    mobile?: Nullable<string>;
    resetType: string;
}

export interface ResetPasswordInput {
    token: string;
    password: string;
}

export interface SendMailInput {
    toEmail: string;
    subject: string;
    body: string;
}

export interface LoginMemberDTO {
    access_token?: Nullable<string>;
    refresh_token?: Nullable<string>;
    about_me?: Nullable<string>;
    address?: Nullable<string>;
    area?: Nullable<string>;
    birth_date?: Nullable<string>;
    birth_place?: Nullable<string>;
    birth_time?: Nullable<string>;
    blood_group?: Nullable<string>;
    business_address?: Nullable<string>;
    business_category?: Nullable<string>;
    business_category_id?: Nullable<string>;
    business_logo?: Nullable<string>;
    business_sub_category?: Nullable<string>;
    business_sub_category_id?: Nullable<string>;
    city?: Nullable<string>;
    city_id?: Nullable<string>;
    committee?: Nullable<string>;
    committee_id?: Nullable<string>;
    company_name?: Nullable<string>;
    created_dt?: Nullable<string>;
    current_activity?: Nullable<string>;
    current_activity_id?: Nullable<string>;
    designation?: Nullable<string>;
    designation_id?: Nullable<string>;
    distance?: Nullable<string>;
    distinct_id?: Nullable<string>;
    education?: Nullable<string>;
    education_id?: Nullable<string>;
    email_address?: Nullable<string>;
    expectation?: Nullable<string>;
    expire_date?: Nullable<string>;
    facebook_profile?: Nullable<string>;
    father_name?: Nullable<string>;
    first_name?: Nullable<string>;
    gender?: Nullable<string>;
    gotra?: Nullable<string>;
    gotra_id?: Nullable<string>;
    head_id?: Nullable<string>;
    head_name?: Nullable<string>;
    head_sub_cast_id?: Nullable<string>;
    height?: Nullable<string>;
    hobby?: Nullable<string>;
    home_lat?: Nullable<string>;
    home_lng?: Nullable<string>;
    is_donor?: Nullable<string>;
    is_expired?: Nullable<string>;
    isImportant?: Nullable<boolean>;
    is_location_enable?: Nullable<string>;
    is_mangal?: Nullable<string>;
    is_rented?: Nullable<string>;
    is_shani?: Nullable<string>;
    is_spect?: Nullable<string>;
    last_login?: Nullable<string>;
    last_name?: Nullable<string>;
    local_address?: Nullable<string>;
    local_community?: Nullable<string>;
    local_community_id?: Nullable<string>;
    login_status?: Nullable<number>;
    marital_status?: Nullable<string>;
    marriage_date?: Nullable<string>;
    matched?: Nullable<string>;
    matrimony?: Nullable<string>;
    member_code?: Nullable<string>;
    member_count?: Nullable<number>;
    mosaad_id?: Nullable<string>;
    mossad?: Nullable<string>;
    mother_name?: Nullable<string>;
    native?: Nullable<string>;
    native_place_id?: Nullable<string>;
    nearBy?: Nullable<string>;
    occupation?: Nullable<string>;
    occupation_id?: Nullable<string>;
    office_lat?: Nullable<string>;
    office_lng?: Nullable<string>;
    online_status?: Nullable<number>;
    password?: Nullable<string>;
    phone?: Nullable<string>;
    pincode?: Nullable<string>;
    plain_password?: Nullable<string>;
    profile_completed?: Nullable<string>;
    profile_password?: Nullable<string>;
    profile_percentage?: Nullable<string>;
    profile_pic?: Nullable<string>;
    region?: Nullable<string>;
    relation?: Nullable<string>;
    relation_id?: Nullable<string>;
    sharing_id?: Nullable<string>;
    state?: Nullable<string>;
    state_id?: Nullable<string>;
    status?: Nullable<string>;
    sub_cast_id?: Nullable<string>;
    sub_community?: Nullable<string>;
    sub_community_id?: Nullable<string>;
    updated_dt?: Nullable<string>;
    user_lat?: Nullable<string>;
    user_lng?: Nullable<string>;
    website?: Nullable<string>;
    weight?: Nullable<string>;
    work_details?: Nullable<string>;
    reminder_birth_date?: Nullable<string>;
    reminder_marriage_date?: Nullable<string>;
    reminder_expire_date?: Nullable<string>;
    matches?: Nullable<string[]>;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    message: string;
}

export interface LoginResponse {
    success: boolean;
    OTP?: Nullable<string>;
    message: string;
    data: LoginMemberDTO;
}

export interface AppVersionDto {
    id: number;
    version: number;
}

export interface UserAddressDTO {
    id: number;
    user_id: number;
    address: string;
    city_id: number;
    states_id: number;
    local_address?: Nullable<string>;
    mosaad_id?: Nullable<number>;
    area?: Nullable<string>;
    pincode?: Nullable<string>;
    addr_type: AddrType;
}

export interface UserMatrimonyDTO {
    id?: Nullable<number>;
    user_id: number;
    birth_time?: Nullable<string>;
    birth_place_id?: Nullable<number>;
    hobby: string;
    about_me?: Nullable<string>;
    weight?: Nullable<number>;
    height?: Nullable<number>;
    is_spect: boolean;
    is_mangal: boolean;
    is_shani: boolean;
    facebook_profile?: Nullable<string>;
    expectation?: Nullable<string>;
}

export interface UserPersonalDetailDTO {
    id: number;
    user_id: number;
    is_donor: boolean;
    matrimony: boolean;
    birth_date?: Nullable<DateTime>;
    native_place_id?: Nullable<number>;
    blood_group?: Nullable<string>;
    current_activity_id?: Nullable<number>;
    marital_status?: Nullable<string>;
    marriage_date?: Nullable<DateTime>;
    gotra_id?: Nullable<number>;
}

export interface UserWorkDetailDTO {
    id: number;
    user_id: number;
    committee_id: number;
    designation_id: number;
    business_category_id?: Nullable<number>;
    business_address?: Nullable<string>;
    business_logo?: Nullable<string>;
    company_name?: Nullable<string>;
    website?: Nullable<string>;
    work_details?: Nullable<string>;
}

export interface UserLocationDTO {
    id: number;
    user_id: number;
    location_type: LocationType;
    latitude: number;
    longitude: number;
    sharing_id: string;
    is_location_enable: boolean;
}

export interface UserDTO {
    id: number;
    role: Role;
    head_id: number;
    member_code?: Nullable<string>;
    email?: Nullable<string>;
    mobile?: Nullable<string>;
    password: string;
    relation_id?: Nullable<number>;
    sub_community_id?: Nullable<number>;
    local_community_id?: Nullable<number>;
    first_name: string;
    last_name_id: number;
    father_name?: Nullable<string>;
    mother_name?: Nullable<string>;
    status: boolean;
    gender: boolean;
    phone?: Nullable<string>;
    profile_pic: string;
    region?: Nullable<string>;
    is_expired: boolean;
    expire_date?: Nullable<DateTime>;
    education_id?: Nullable<number>;
    occupation_id?: Nullable<number>;
    deleted: boolean;
    login_status?: Nullable<boolean>;
    last_login?: Nullable<DateTime>;
    profile_percent: number;
    updated?: Nullable<DateTime>;
    userAddress?: Nullable<UserAddressDTO>;
    userLocation?: Nullable<UserLocationDTO>;
    userMatrimony?: Nullable<UserMatrimonyDTO>;
    userPersonalDetail?: Nullable<UserPersonalDetailDTO>;
    userWorkDetail?: Nullable<UserWorkDetailDTO>;
    matchedFields?: Nullable<string[]>;
    distance?: Nullable<string>;
    nearBy?: Nullable<string>;
    member_count?: Nullable<number>;
    matched?: Nullable<string>;
    reminder_birth_date?: Nullable<string>;
    reminder_marriage_date?: Nullable<string>;
    reminder_expire_date?: Nullable<string>;
    profile_completed?: Nullable<string>;
    online_status?: Nullable<number>;
    head_name?: Nullable<string>;
    last_name?: Nullable<string>;
    city?: Nullable<string>;
    state?: Nullable<string>;
    sub_community?: Nullable<string>;
    local_community?: Nullable<string>;
    relation?: Nullable<string>;
    designation?: Nullable<string>;
    designation_id?: Nullable<number>;
    committee?: Nullable<string>;
    committee_id?: Nullable<number>;
    education?: Nullable<string>;
    occupation?: Nullable<string>;
    current_activity?: Nullable<string>;
    gotra?: Nullable<string>;
    native?: Nullable<string>;
    business_category?: Nullable<string>;
    business_sub_category?: Nullable<string>;
    mossad?: Nullable<string>;
}

export interface ChangePasswordResponse {
    message: string;
}

export interface GetInactiveUsersResponse {
    success: boolean;
    message?: Nullable<string>;
    total_records: number;
    members: UserDTO[];
}

export interface StatusChangeResponseDto {
    success: boolean;
    message: string;
}

export interface GetContactListResponse {
    success: boolean;
    message: string;
    members?: Nullable<UserDTO[]>;
}

export interface SearchByCityResponse {
    success: boolean;
    totalHead: number;
    totalMem: number;
    members: UserDTO[];
}

export interface GetUsersByDateResponse {
    success: boolean;
    message?: Nullable<string>;
    total_records: number;
    members: UserDTO[];
}

export interface UserActivityStatusDTO {
    id: number;
    last_login?: Nullable<DateTime>;
    login_status?: Nullable<boolean>;
    online_status: number;
}

export interface GetUserActivityStatusResponse {
    success: boolean;
    message?: Nullable<string>;
    data?: Nullable<UserActivityStatusDTO[]>;
}

export interface GetFamilyMembersResponse {
    success: boolean;
    total_records: number;
    members?: Nullable<UserDTO[]>;
}

export interface SearchCommitteeUsersResponse {
    success: boolean;
    message?: Nullable<string>;
    total_records: number;
    members?: Nullable<UserDTO[]>;
}

export interface MasterDTO {
    id: string;
    name: string;
    states_id?: Nullable<number>;
    sub_community_id?: Nullable<number>;
}

export interface GetMastersResponseDTO {
    success: boolean;
    message?: Nullable<string>;
    data: MasterDTO[];
    deleted: string[];
    last_updated: number;
}

export interface CityDto {
    id: number;
    name: string;
    count: number;
}

export interface CityResponseDto {
    data?: Nullable<CityDto[]>;
    deleted?: Nullable<number[]>;
    last_updated?: Nullable<string>;
}

export interface StatisticsDataDto {
    TotalFamily: number;
    TotalVillages?: Nullable<number>;
    TotalMembers: number;
    TotalMale: number;
    TotalFemale: number;
    TotalUnmarriedMale: number;
    TotalUnmarriedFemale: number;
    TotalInterestedMale: number;
    TotalInterestedFemale: number;
}

export interface StatisticsCityDto {
    city_id: number;
}

export interface StatisticsResponseDto {
    success: boolean;
    data: StatisticsDataDto;
    cities: StatisticsCityDto[];
}

export interface CountListDTO {
    business_categories: string;
    cities: string;
    committees: string;
    current_activity: string;
    designations: string;
    districts: string;
    educations: string;
    local_community: string;
    occupation: string;
    relations: string;
    states: string;
    sub_casts: string;
    sub_community: string;
    gotra: string;
}

export interface UserCountsDTO {
    matrimony_counts: string;
    status_counts: string;
}

export interface MastersCountResponseDTO {
    success: boolean;
    message: string;
    countList: CountListDTO;
    userCounts: UserCountsDTO;
}

export interface SearchResult {
    totalRecords: number;
    members: UserDTO[];
}

export interface Reminder {
    id: number;
    user_id: number;
    rem_date: DateTime;
    rem_type: string;
    message: string;
}

export interface UploadModel {
    id: number;
    user_id: number;
    file_name: string;
    file_path: string;
    updated: DateTime;
}

export interface IQuery {
    getFamilyMembers(head_id: number, loginUserId?: Nullable<number>): GetFamilyMembersResponse | Promise<GetFamilyMembersResponse>;
    getUserProfile(id: number): UserDTO | Promise<UserDTO>;
    searchCommitteeUsers(input: SearchCommitteeUsersInput): SearchCommitteeUsersResponse | Promise<SearchCommitteeUsersResponse>;
    usersByDateRange(fromDate: string, toDate: string, page: number, limit: number): UserDTO[] | Promise<UserDTO[]>;
    usersByDate(input: GetUsersByDateInput): GetUsersByDateResponse | Promise<GetUsersByDateResponse>;
    getInactiveUsers(input: GetInactiveUsersInput): GetInactiveUsersResponse | Promise<GetInactiveUsersResponse>;
    getSharedProfiles(userId: number): UserDTO[] | Promise<UserDTO[]>;
    getSharingProfiles(userId: number): UserDTO[] | Promise<UserDTO[]>;
    getContactList(input: GetContactListInput): GetContactListResponse | Promise<GetContactListResponse>;
    searchByCity(input: SearchByCityInput): SearchByCityResponse | Promise<SearchByCityResponse>;
    getMastersCounts(): MastersCountResponseDTO | Promise<MastersCountResponseDTO>;
    getCities(date?: Nullable<DateInputDto>): GetMastersResponseDTO | Promise<GetMastersResponseDTO>;
    getStates(date?: Nullable<DateInputDto>): GetMastersResponseDTO | Promise<GetMastersResponseDTO>;
    getBusinessCategories(date?: Nullable<DateInputDto>): GetMastersResponseDTO | Promise<GetMastersResponseDTO>;
    getCurrentActivities(date?: Nullable<DateInputDto>): GetMastersResponseDTO | Promise<GetMastersResponseDTO>;
    getOccupations(date?: Nullable<DateInputDto>): GetMastersResponseDTO | Promise<GetMastersResponseDTO>;
    getCommittees(date?: Nullable<DateInputDto>): GetMastersResponseDTO | Promise<GetMastersResponseDTO>;
    getDesignations(date?: Nullable<DateInputDto>): GetMastersResponseDTO | Promise<GetMastersResponseDTO>;
    getEducations(date?: Nullable<DateInputDto>): GetMastersResponseDTO | Promise<GetMastersResponseDTO>;
    getSubCommunities(date?: Nullable<DateInputDto>): GetMastersResponseDTO | Promise<GetMastersResponseDTO>;
    getLocalCommunities(subCommunityId?: Nullable<number>, date?: Nullable<DateInputDto>): GetMastersResponseDTO | Promise<GetMastersResponseDTO>;
    getRelations(date?: Nullable<DateInputDto>): GetMastersResponseDTO | Promise<GetMastersResponseDTO>;
    getGotras(date?: Nullable<DateInputDto>): GetMastersResponseDTO | Promise<GetMastersResponseDTO>;
    getSubCasts(date?: Nullable<DateInputDto>): GetMastersResponseDTO | Promise<GetMastersResponseDTO>;
    getCitiesByState(stateId: number, date?: Nullable<string>, subCommunityId?: Nullable<number>): CityResponseDto | Promise<CityResponseDto>;
    getStatistics(input: StatisticsInputDto): StatisticsResponseDto | Promise<StatisticsResponseDto>;
    reminders(): Reminder[] | Promise<Reminder[]>;
    reminder(id: number): Reminder | Promise<Reminder>;
    getUserFiles(user_id: number): UploadModel[] | Promise<UploadModel[]>;
    smartSearch(input: SearchInput): SearchResult | Promise<SearchResult>;
    smartFilter(input: SearchRequestDTO): SearchResult | Promise<SearchResult>;
    nearByUsers(filter: GetNearbyUsersInput): SearchResult | Promise<SearchResult>;
    isAppVersionExists(version: number): boolean | Promise<boolean>;
    getAppVersion(): Nullable<AppVersionDto> | Promise<Nullable<AppVersionDto>>;
}

export interface IMutation {
    sendNotification(userId: number, title: string, message: string): string | Promise<string>;
    changePassword(ChangePasswordInput: ChangePasswordInput): ChangePasswordResponse | Promise<ChangePasswordResponse>;
    upsertUser(upsertUserInput: UpsertUserInput): UserDTO | Promise<UserDTO>;
    updateLastLogin(user_id: number): boolean | Promise<boolean>;
    getUserActivityStatus(input: GetUserActivityStatusInput): GetUserActivityStatusResponse | Promise<GetUserActivityStatusResponse>;
    innerLogin(input: InnerLoginInput): string | Promise<string>;
    innerLogout(input: InnerLogoutInput): string | Promise<string>;
    deleteUserById(userId: number): string | Promise<string>;
    changeRole(input: ChangeRoleInput): string | Promise<string>;
    statusChange(data: StatusChangeInputDto): StatusChangeResponseDto | Promise<StatusChangeResponseDto>;
    createReminder(input: CreateReminderInput): Reminder | Promise<Reminder>;
    updateReminder(input: UpdateReminderInput): Reminder | Promise<Reminder>;
    removeReminder(id: number): Reminder | Promise<Reminder>;
    uploadFile(file: Upload, user_id: number): UploadModel | Promise<UploadModel>;
    deleteUserFile(id: number, user_id: number): UploadModel | Promise<UploadModel>;
    register(RegisterInput: RegisterInput): AuthResponse | Promise<AuthResponse>;
    login(LoginInput: LoginInput): LoginResponse | Promise<LoginResponse>;
    refreshToken(token: string): AuthResponse | Promise<AuthResponse>;
    updateDeviceToken(): boolean | Promise<boolean>;
    forgotPassword(forgotPasswordInput: ForgotPasswordInput): string | Promise<string>;
    resetPassword(resetPasswordInput: ResetPasswordInput): string | Promise<string>;
    sendMail(input: SendMailInput): string | Promise<string>;
}

export type DateTime = any;
export type Upload = any;
type Nullable<T> = T | null;
